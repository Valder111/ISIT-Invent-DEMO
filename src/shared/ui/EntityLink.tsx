import { Link, type LinkProps } from 'react-router-dom'

/**
 * Ссылка на другую сущность/страницу — открывается в новой вкладке,
 * чтобы не терять контекст текущей работы (Ctrl+клик работает).
 */
export function EntityLink({ target, rel, title, ...props }: LinkProps) {
  return (
    <Link
      {...props}
      target={target ?? '_blank'}
      rel={rel ?? 'noopener noreferrer'}
      title={title ?? 'Открыть в новой вкладке'}
    />
  )
}
