import JSZip from 'jszip'
import { saveAs } from "file-saver"
import { useCallback } from 'react'

type ZipFilesProps = {
    images: string[]
    imageNames: string[]
}

const ZipFiles: React.FC<ZipFilesProps> = ({ images, imageNames }) => {

    const download = useCallback(
        async (imagesToDownload: string[], imageNamesToDownload: string[]) => {
            const zip = new JSZip()
            const imagesFolder = zip.folder("images")

            const imagesFetcher = await Promise.all(
                imagesToDownload.map(async (imgSrc) => {
                    const res = await fetch(imgSrc)
                    return res.blob()
                })
            )

            imagesFetcher.forEach((imgBlob, index) => {
                imagesFolder?.file(`${imageNamesToDownload[index]}.webp`, imgBlob)
            })

            zip.generateAsync({ type: "blob" }).then((content: string | Blob) => {
                saveAs(content, "images.zip")
            })
        },
        []
    )

    return (
        <>
            {images.length > 0 && (
                <button type="button"
                    className="bg-transparent hover:bg-purple-500 text-purple-700 font-semibold
                 hover:text-white py-2 px-4 border border-purple-500 hover:border-transparent rounded"
                    onClick={() => download(images, imageNames)}>
                    Download as ZIP
                </button>
            )}
        </>
    );
}

export default ZipFiles