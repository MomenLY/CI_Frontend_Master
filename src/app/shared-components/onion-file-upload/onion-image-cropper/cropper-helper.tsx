import { DependencyList, useEffect } from "react"
import { PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop"
import { TO_RADIANS } from "./cropper-configs"

export const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) => {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export const useDebounceEffect = (
    fn: () => void,
    waitTime: number,
    deps?: DependencyList,
) => {
    useEffect(() => {
        const t = setTimeout(() => {
            fn.apply(undefined, deps)
        }, waitTime)

        return () => {
            clearTimeout(t)
        }
    }, deps)
}


export const canvasPreview = (
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    crop: PixelCrop,
    scale = 1,
    rotate = 0,
) => {
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('No 2d context')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    // devicePixelRatio slightly increases sharpness on retina devices
    // at the expense of slightly slower render times and needing to
    // size the image back down if you want to download/upload and be
    // true to the images natural size.
    const pixelRatio = window.devicePixelRatio
    // const pixelRatio = 1

    canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
    canvas.height = Math.floor(crop.height * scaleY * pixelRatio)

    ctx.scale(pixelRatio, pixelRatio)
    ctx.imageSmoothingQuality = 'high'

    const cropX = crop.x * scaleX
    const cropY = crop.y * scaleY

    const rotateRads = rotate * TO_RADIANS
    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2

    ctx.save()

    // 5) Move the crop origin to the canvas origin (0,0)
    ctx.translate(-cropX, -cropY)
    // 4) Move the origin to the center of the original position
    ctx.translate(centerX, centerY)
    // 3) Rotate around the origin
    ctx.rotate(rotateRads)
    // 2) Scale the image
    ctx.scale(scale, scale)
    // 1) Move the center of the image to the origin (0,0)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
    )
    ctx.restore()
}

export const isImageFile = (fileType) => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    return imageTypes.includes(fileType);
};

export const sanitizeFilename = (filename: string): string => {
    // Replace spaces with hyphens
    let sanitized = filename.replace(/\s+/g, '-');
    // Remove special characters except for hyphens, underscores, and dots
    sanitized = sanitized.replace(/[^a-zA-Z0-9\-\_\.]/g, '');
    return  sanitized;
};

export const convertImageToDataURL = (file, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () =>
        callback(reader.result?.toString() || ''),
    )
    reader.readAsDataURL(file); 
}
  

