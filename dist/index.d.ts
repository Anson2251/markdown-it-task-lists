import MarkdownIt from 'markdown-it';
interface TaskListsOptions {
    enabled?: boolean;
    label?: boolean;
    labelAfter?: boolean;
}
export default function taskLists(md: MarkdownIt, options?: TaskListsOptions): void;
export {};
