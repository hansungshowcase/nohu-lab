declare module 'html2canvas' {
  interface Options {
    scale?: number
    backgroundColor?: string | null
    useCORS?: boolean
    logging?: boolean
    width?: number
    height?: number
    x?: number
    y?: number
  }

  export default function html2canvas(
    element: HTMLElement,
    options?: Options
  ): Promise<HTMLCanvasElement>
}
