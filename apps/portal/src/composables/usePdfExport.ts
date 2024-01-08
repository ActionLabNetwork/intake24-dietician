import html2pdf from 'html2pdf.js'

export function usePdfExport() {
  const exportToPdf = (element: HTMLElement, filename: string) => {
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { allowTaint: true },
      jsPDF: {
        unit: 'in',
        format: 'a2',
        orientation: 'portrait',
        compress: true,
        // encryption: { userPassword: 'i24-d' },
      },
    }
    html2pdf().set(opt).from(element).save()
  }

  return { exportToPdf }
}
