import html2pdf from 'html2pdf.js'

export function usePdfExport() {
  const exportToPdf = (element: HTMLElement, filename: string) => {
    console.log('Exporting pdf...', { element }, { filename })
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { allowTaint: false },
      jsPDF: {
        unit: 'in',
        format: 'a3',
        orientation: 'portrait',
        compress: true,
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }
    html2pdf().set(opt).from(element).save()
  }

  return { exportToPdf }
}
