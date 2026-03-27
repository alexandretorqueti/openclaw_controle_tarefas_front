/**
 * @AGENT-NOTE: Arquivo de barril para exportar todos os componentes da TaskDetail.
 * Mantém a estrutura organizada e facilita importações externas.
 */
export { default as TaskDetailPage } from './TaskDetailPage';
export { default as TaskProperties } from './sections/TaskProperties';
export { default as TaskChecklists } from './sections/TaskChecklists';
export { default as TaskHistory } from './sections/TaskHistory';
export { default as TaskLogs } from './sections/TaskLogs';
export { default as TaskDependencies } from './sections/TaskDependencies';
export { default as TaskAttachments } from './sections/TaskAttachments';
export * from './sections/TaskHeader';
export * from './sections/TaskOverview';
export * from './sections/TaskComments';
export * from './sections/TaskExecutionLogs';
export * from './sections/TaskHistory';
export * from './sections/TaskDependencies';
export * from './sections/TaskAttachments';
export * from './sections/TaskProperties';
export * from './components/CommentItem';
export * from './components/CommentForm';
export * from './components/LogItem';
export * from './components/HistoryItem';
export * from './components/DependencyItem';
export * from './components/AttachmentItem';
export * from './hooks/useTaskDetail';
export * from './hooks/useComments';
export * from './hooks/useTaskData';
export { useTaskDetailActions } from './hooks/TaskDetailActions';
export { getTaskDetailProps } from './hooks/TaskDetailProps';
export { useTaskRelationsData } from './hooks/TaskRelationsData';

export type { TaskDetailPageProps } from './TaskDetailPage';
export type { TaskPropertiesProps } from './sections/TaskProperties';
export type { TaskChecklistsProps } from './sections/TaskChecklists';
export type { TaskHistoryProps } from './sections/TaskHistory';
export type { TaskLogsProps } from './sections/TaskLogs';
export type { TaskDependenciesProps } from './sections/TaskDependencies';
export type { TaskAttachmentsProps } from './sections/TaskAttachments';
