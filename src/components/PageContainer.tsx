/** Shallow side margins, wide max width — reduces empty space on large screens. */
export default function PageContainer({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mx-auto w-full max-w-[1800px] px-4 sm:px-5 md:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  )
}
