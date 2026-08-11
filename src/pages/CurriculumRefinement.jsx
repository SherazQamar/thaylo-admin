import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Info, Loader2, Sparkles } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import ConfirmModal from '../components/ConfirmModal'
import CurriculumLessonPreview from '../components/CurriculumLessonPreview'
import CurriculumClassPreviewModal from '../components/CurriculumClassPreviewModal'
import CurriculumAiPlanPreviewModal from '../components/CurriculumAiPlanPreviewModal'
import CurriculumRefinementChat from '../components/CurriculumRefinementChat'
import { notify } from '../lib/notify'
import { useNotifyError } from '../hooks/useNotifyError'
import {
  CURRICULUM_BETA_INFO_MESSAGE,
  CURRICULUM_STATUS_LABELS,
  countLessonsWithRuntime,
  curriculumQueryKeys,
  fetchCurriculum,
  generateCurriculumRuntimes,
  isCurriculumMockMode,
  refineCurriculumWithAi,
  updateCurriculumStatus,
} from '../lib/curriculum-api'

const SUPER_ADMIN_ROOT = {
  href: '/super-admin/dashboard',
  label: 'Super Admin Dashboard',
}

function StatusBadge({ status }) {
  const styles = {
    DRAFT: 'border-white/20 text-white/60 bg-white/5',
    IN_REVIEW: 'border-[#FFC542]/40 text-[#FFC542] bg-[#FFC542]/10',
    PUBLISHED: 'border-[#00CED1] text-[#00CED1] bg-[#00CED1]/10',
    ARCHIVED: 'border-[#FF7B7B]/40 text-[#FF7B7B] bg-[#FF7B7B]/10',
  }

  return (
    <span
      className={
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ' +
        (styles[status] ?? styles.DRAFT)
      }
    >
      {CURRICULUM_STATUS_LABELS[status] ?? status}
    </span>
  )
}

export default function CurriculumRefinement() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const curriculumId = Number(id)
  const [classPreviewOpen, setClassPreviewOpen] = useState(false)
  const [aiPlanPreviewOpen, setAiPlanPreviewOpen] = useState(false)
  const [previewLessonIndex, setPreviewLessonIndex] = useState(0)
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false)
  const [publishLoadingMessage, setPublishLoadingMessage] = useState('')

  const openClassPreview = (lessonIndex = 0) => {
    setPreviewLessonIndex(lessonIndex)
    setClassPreviewOpen(true)
  }

  const openAiPlanPreview = (lessonIndex = 0) => {
    setPreviewLessonIndex(lessonIndex)
    setAiPlanPreviewOpen(true)
  }

  const breadcrumbs = useMemo(
    () => [
      SUPER_ADMIN_ROOT,
      { href: '/super-admin/curriculum', label: 'Curriculum' },
      { href: `/super-admin/curriculum/${id}`, label: 'Class setup' },
    ],
    [id],
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: curriculumQueryKeys.detail(curriculumId),
    queryFn: () => fetchCurriculum(curriculumId),
    enabled: Number.isFinite(curriculumId),
  })
  useNotifyError(error, isError)

  useEffect(() => {
    if (location.state?.previewAiPlan && data?.scriptJson) {
      openAiPlanPreview(0)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state, data?.scriptJson, navigate, location.pathname])

  const refineMutation = useMutation({
    mutationFn: (message) => refineCurriculumWithAi(curriculumId, { message }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(curriculumId) })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'curriculum'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: (status) => updateCurriculumStatus(curriculumId, { status }),
    onSuccess: async (_data, status) => {
      await queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(curriculumId) })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'curriculum'] })
      if (status === 'PUBLISHED') {
        setPublishConfirmOpen(false)
      }
    },
  })

  const generateRuntimesMutation = useMutation({
    mutationFn: () => generateCurriculumRuntimes(curriculumId),
    onSuccess: async (result) => {
      if (result?.curriculum) {
        queryClient.setQueryData(curriculumQueryKeys.detail(curriculumId), result.curriculum)
      }
      await queryClient.invalidateQueries({ queryKey: curriculumQueryKeys.detail(curriculumId) })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'curriculum'] })
    },
  })

  useNotifyError(generateRuntimesMutation.error, generateRuntimesMutation.isError)
  useNotifyError(statusMutation.error, statusMutation.isError)
  useNotifyError(refineMutation.error, refineMutation.isError)

  const runtimeReadyCount = useMemo(
    () => countLessonsWithRuntime(data?.scriptJson),
    [data?.scriptJson],
  )
  const lessonCount = data?.scriptJson?.lessons?.length ?? 0
  const allRuntimesReady = lessonCount > 0 && runtimeReadyCount >= lessonCount
  const isGeneratingPlans = generateRuntimesMutation.isPending
  const isPublishing = statusMutation.isPending
  const isAiBusy = isGeneratingPlans || isPublishing

  async function handlePublishConfirmed() {
    setPublishConfirmOpen(false)
    try {
      const totalLessons = data?.scriptJson?.lessons?.length ?? 0
      let readyCount = countLessonsWithRuntime(data?.scriptJson)

      if (totalLessons > 0 && readyCount < totalLessons) {
        setPublishLoadingMessage('Generating AI lesson plans, then publishing…')
        const result = await generateRuntimesMutation.mutateAsync()
        const scriptJson = result?.curriculum?.scriptJson ?? data?.scriptJson
        readyCount = countLessonsWithRuntime(scriptJson)
        if (readyCount < totalLessons) {
          throw new Error('AI lesson plans could not be generated for all lessons.')
        }
      }

      setPublishLoadingMessage('Publishing curriculum for students…')
      await statusMutation.mutateAsync('PUBLISHED')
    } catch (err) {
      notify.error(err)
    } finally {
      setPublishLoadingMessage('')
    }
  }

  const isPublished = data?.status === 'PUBLISHED'
  const isArchived = data?.status === 'ARCHIVED'
  const chatDisabled = isPublished || isArchived

  return (
    <SuperAdminLayout title="Curriculum — Class setup" breadcrumbs={breadcrumbs}>
      <div className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Link
              to="/super-admin/curriculum"
              className="mt-1 w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white shrink-0"
              aria-label="Back to curriculum list"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-white text-2xl font-bold">Class setup</h2>
                {data?.status && <StatusBadge status={data.status} />}
                {data?.version != null && (
                  <span className="text-white/40 text-xs">v{data.version}</span>
                )}
              </div>
              <p className="text-white/50 text-sm mt-1">
                Review extracted content, then publish when ready.{' '}
                <strong className="text-white/70">Publish</strong> generates AI lesson plans and
                makes the curriculum available to students.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#00CED1]/30 bg-[#00CED1]/10 px-4 py-3 text-[#00CED1] text-sm flex items-start gap-2">
            <Info size={16} className="shrink-0 mt-0.5" />
            <span>
              <strong>Class setup</strong> — content is extracted from your document as-is.
              AI training lives under <strong>AI Control</strong>. {CURRICULUM_BETA_INFO_MESSAGE}
            </span>
          </div>

          {isCurriculumMockMode() && (
            <div className="rounded-2xl border border-[#FFC542]/30 bg-[#FFC542]/10 px-4 py-3 text-[#FFC542] text-sm flex items-center gap-2">
              <Sparkles size={16} className="shrink-0" />
              Mock mode — connect backend for real document extraction.
            </div>
          )}

          {isError && (
            <p className="text-white/50 text-sm">
              Unable to load class setup right now.{' '}
              <button
                type="button"
                onClick={() => navigate('/super-admin/curriculum')}
                className="text-[#00CED1] underline text-xs"
              >
                Back to list
              </button>
            </p>
          )}
        </div>

        {isLoading && (
          <div
            className="rounded-2xl p-10 text-center text-white/40 text-sm"
            style={{ backgroundColor: '#313044' }}
          >
            Loading class setup…
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 items-start">
            <div
              className="xl:col-span-3 rounded-2xl p-5 lg:p-6"
              style={{ backgroundColor: '#313044' }}
            >
              <CurriculumLessonPreview
                scriptJson={data.scriptJson}
                onPreviewClass={openClassPreview}
                onPreviewAiPlan={openAiPlanPreview}
                status={data.status}
                isArchived={isArchived}
                statusPending={isPublishing}
                workflowPending={isAiBusy}
                runtimeReadyCount={runtimeReadyCount}
                lessonCount={lessonCount}
                onSubmitForReview={() => statusMutation.mutate('IN_REVIEW')}
                onPublish={() => setPublishConfirmOpen(true)}
              />
            </div>

            <div className="xl:col-span-2 xl:sticky xl:top-24 self-start w-full xl:h-[calc(100dvh-6.5rem)] flex flex-col min-h-0">
              <div className="flex-1 min-h-0 flex flex-col">
                <CurriculumRefinementChat
                  messages={data.refinementMessages ?? []}
                  onSend={(message) => refineMutation.mutateAsync(message)}
                  isSending={refineMutation.isPending}
                  disabled={chatDisabled}
                />
              </div>
              {chatDisabled && (
                <p className="shrink-0 text-white/40 text-xs mt-2 px-1">
                  {isPublished
                    ? 'Published curriculum is read-only.'
                    : 'This curriculum is archived.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {data?.scriptJson && (
        <CurriculumClassPreviewModal
          open={classPreviewOpen}
          onClose={() => setClassPreviewOpen(false)}
          scriptJson={data.scriptJson}
          title={data.title}
          initialLessonIndex={previewLessonIndex}
        />
      )}

      {data?.scriptJson && (
        <CurriculumAiPlanPreviewModal
          open={aiPlanPreviewOpen}
          onClose={() => setAiPlanPreviewOpen(false)}
          scriptJson={data.scriptJson}
          title={data.title}
          initialLessonIndex={previewLessonIndex}
        />
      )}

      <ConfirmModal
        open={publishConfirmOpen}
        onClose={() => {
          if (!isAiBusy) setPublishConfirmOpen(false)
        }}
        onConfirm={() => void handlePublishConfirmed()}
        title="Publish curriculum?"
        message={
          allRuntimesReady
            ? 'Students can be assigned to this curriculum after publishing. Further edits will be locked.'
            : 'AI lesson plans will be generated automatically for all lessons, then this curriculum will be published. Further edits will be locked.'
        }
        confirmLabel="Publish"
        variant="primary"
        isLoading={isAiBusy}
        icon={
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#00CED1]/15">
            <CheckCircle2 size={28} className="text-[#00CED1]" />
          </div>
        }
      />

      {isAiBusy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111023]/80 backdrop-blur-sm px-4">
          <div
            className="max-w-md w-full rounded-2xl border border-[#00CED1]/30 bg-[#313044] px-6 py-8 text-center"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="w-10 h-10 text-[#00CED1] animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">
              {generateRuntimesMutation.isPending
                ? 'Generating AI lesson plans…'
                : 'Publishing curriculum…'}
            </p>
            <p className="text-white/55 text-sm mt-2 leading-relaxed">
              {generateRuntimesMutation.isPending
                ? 'Creating shared 15-minute teaching scripts for each lesson. This usually takes 30–90 seconds.'
                : publishLoadingMessage ||
                  'Please keep this page open while we finish.'}
            </p>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  )
}
