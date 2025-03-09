
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          title: "group-[.toast]:text-foreground group-[.toast]:font-semibold text-base",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "!bg-gradient-to-r from-green-50 to-teal-50 !border-green-200 !text-green-800",
          info: "!bg-gradient-to-r from-blue-50 to-indigo-50 !border-blue-200 !text-blue-800",
          warning: "!bg-gradient-to-r from-amber-50 to-yellow-50 !border-amber-200 !text-amber-800",
          error: "!bg-gradient-to-r from-red-50 to-rose-50 !border-red-200 !text-red-800",
          // We've removed the 'fancy' custom class as it's not in the ToastClassnames type
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
