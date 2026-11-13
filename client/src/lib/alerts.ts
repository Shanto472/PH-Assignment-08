import Swal from "sweetalert2";

function getSwalColors() {
  const isDark =
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark");

  return {
    background: isDark ? "#131e1a" : "#ffffff",
    color: isDark ? "#f3f6f4" : "#14211c",
    confirmButtonColor: isDark ? "#10b981" : "#0f6244",
    cancelButtonColor: isDark ? "#334155" : "#64748b",
  };
}

export async function showSuccessAlert(title: string, text: string) {
  const colors = getSwalColors();
  return Swal.fire({
    icon: "success",
    title,
    text,
    timer: 2200,
    showConfirmButton: false,
    background: colors.background,
    color: colors.color,
  });
}

export async function showErrorAlert(title: string, text: string) {
  const colors = getSwalColors();
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: colors.confirmButtonColor,
    background: colors.background,
    color: colors.color,
  });
}

export async function confirmActionAlert(options: {
  title: string;
  text: string;
  confirmText?: string;
}): Promise<boolean> {
  const colors = getSwalColors();
  const result = await Swal.fire({
    icon: "warning",
    title: options.title,
    text: options.text,
    showCancelButton: true,
    confirmButtonText: options.confirmText || "Yes, confirm",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#dc2626",
    cancelButtonColor: colors.cancelButtonColor,
    background: colors.background,
    color: colors.color,
    reverseButtons: true,
  });

  return result.isConfirmed;
}
