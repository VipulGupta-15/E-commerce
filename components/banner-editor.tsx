import React, { useState, forwardRef, useImperativeHandle } from "react"
import { Rnd } from "react-rnd"
import { FaStar, FaHeart, FaBolt, FaGift, FaPlus } from "react-icons/fa"
import { Particles } from "react-tsparticles"
import { useDropzone } from "react-dropzone"
import { Slider } from "@/components/ui/slider"

const BADGE_TYPES = [
  { label: "Exclusive", value: "Exclusive" },
  { label: "New", value: "New" },
  { label: "Limited Time", value: "Limited Time" },
  { label: "New Arrivals", value: "New Arrivals" },
]

const ICONS = [
  { name: "FaStar", Icon: FaStar },
  { name: "FaHeart", Icon: FaHeart },
  { name: "FaBolt", Icon: FaBolt },
  { name: "FaGift", Icon: FaGift },
]

const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48]
const fontWeights = [400, 500, 600, 700, 800]

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 320;
const CANVAS_PADDING = 32;
const MIN_MARGIN = 24;

type TextElement = {
  id: string
  type: "text"
  text: string
  x: number
  y: number
  width: number
  height: number
  style: {
    color: string
    fontWeight: number
    fontSize: number
    letterSpacing?: number
    textAlign: "left" | "center" | "right"
  }
}

type BadgeElement = {
  id: string
  type: "badge"
  text: string
  x: number
  y: number
  width: number
  height: number
  style: {
    background: string
    color: string
    fontWeight: number
    borderRadius: number
    fontSize: number
    padding: string
    border: string
    boxShadow: string
    letterSpacing?: number
    textAlign: "center"
  }
}

type IconElement = {
  id: string
  type: "icon"
  icon: string
  x: number
  y: number
  width: number
  height: number
  style: Record<string, any>
}

type ImageElement = {
  id: string
  type: "image"
  imageUrl: string
  x: number
  y: number
  width: number
  height: number
  style: Record<string, any>
}

type BannerElement = TextElement | BadgeElement | IconElement | ImageElement

const defaultElements: BannerElement[] = [
  {
    id: "badge",
    type: "badge",
    text: "Exclusive",
    x: 20,
    y: 20,
    width: 110,
    height: 36,
    style: {
      background: "rgba(255,255,255,0.18)",
      color: "#fff",
      fontWeight: 600,
      borderRadius: 18,
      fontSize: 16,
      padding: "6px 18px",
      border: "1.5px solid #fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      letterSpacing: 0.5,
      textAlign: "center",
    },
  },
  {
    id: "mainText",
    type: "text",
    text: "BRAND FEST",
    x: 30,
    y: 70,
    width: 300,
    height: 48,
    style: {
      color: "#fff",
      fontWeight: 700,
      fontSize: 36,
      letterSpacing: 0.5,
      textAlign: "left",
    },
  },
  {
    id: "subText",
    type: "text",
    text: "Min 50% OFF",
    x: 30,
    y: 120,
    width: 250,
    height: 40,
    style: {
      color: "#fff",
      fontWeight: 700,
      fontSize: 28,
      letterSpacing: 0.5,
      textAlign: "left",
    },
  },
  {
    id: "descText",
    type: "text",
    text: "Top Brands",
    x: 30,
    y: 170,
    width: 200,
    height: 32,
    style: {
      color: "#fff",
      fontWeight: 400,
      fontSize: 20,
      letterSpacing: 0.5,
      textAlign: "left",
    },
  },
  {
    id: "icon",
    type: "icon",
    icon: "FaStar",
    x: 370,
    y: 30,
    width: 36,
    height: 36,
    style: {},
  },
]

function getIconComponent(name: string) {
  const found = ICONS.find(i => i.name === name)
  return found ? found.Icon : FaStar
}

interface BannerEditorProps {
  initialElements?: BannerElement[]
  backgroundImageUrl?: string
}

export interface BannerEditorRef {
  getCurrentState: () => {
    elements: BannerElement[]
    backgroundImage: string | null
    backgroundOffset: { x: number; y: number }
  }
}

const BannerEditor = forwardRef<BannerEditorRef, BannerEditorProps>(({ initialElements, backgroundImageUrl }, ref) => {
  const [elements, setElements] = useState<BannerElement[]>(initialElements || defaultElements)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(backgroundImageUrl || null)
  const [bgOffset, setBgOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [imgDims, setImgDims] = useState<{ width: number; height: number } | null>(null)

  // Load image and get its natural size
  React.useEffect(() => {
    if (!backgroundImage) {
      setImgDims(null)
      return
    }
    const img = new window.Image()
    img.onload = () => {
      setImgDims({ width: img.naturalWidth, height: img.naturalHeight })
      // Reset offset if image changes
      setBgOffset({ x: 0, y: 0 })
    }
    img.src = backgroundImage
  }, [backgroundImage])

  const selectedElement = elements.find((el) => el.id === selectedId)

  // Expose current state to parent component
  useImperativeHandle(ref, () => ({
    getCurrentState: () => ({
      elements,
      backgroundImage,
      backgroundOffset: bgOffset
    })
  }), [elements, backgroundImage, bgOffset])

  const updateElement = (id: string, updates: any) => {
    setElements((els) =>
      els.map((el) => (el.id === id ? { ...el, ...updates, style: { ...el.style, ...updates.style } } : el))
    )
  }

  // Add new element handlers
  const addElement = (type: string) => {
    const id = `${type}_${Date.now()}`
    // Center new elements by default
    const defaultX = CANVAS_WIDTH / 2 - 90;
    const defaultY = CANVAS_HEIGHT / 2 - 24;
    if (type === "text") {
      setElements((els) => [
        ...els,
        {
          id,
          type: "text",
          text: "New Text",
          x: defaultX,
          y: defaultY,
          width: 180,
          height: 36,
          style: {
            color: "#fff",
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: 0.5,
            textAlign: "left",
          },
        } as TextElement,
      ])
      setSelectedId(id)
    } else if (type === "badge") {
      setElements((els) => [
        ...els,
        {
          id,
          type: "badge",
          text: "Exclusive",
          x: defaultX,
          y: defaultY - 40,
          width: 110,
          height: 36,
          style: {
            background: "rgba(255,255,255,0.18)",
            color: "#fff",
            fontWeight: 600,
            borderRadius: 18,
            fontSize: 16,
            padding: "6px 18px",
            border: "1.5px solid #fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            letterSpacing: 0.5,
            textAlign: "center",
          },
        } as BadgeElement,
      ])
      setSelectedId(id)
    } else if (type === "icon") {
      setElements((els) => [
        ...els,
        {
          id,
          type: "icon",
          icon: "FaStar",
          x: defaultX + 200,
          y: defaultY - 60,
          width: 36,
          height: 36,
          style: {},
        } as IconElement,
      ])
      setSelectedId(id)
    } else if (type === "image") {
      setElements((els) => [
        ...els,
        {
          id,
          type: "image",
          imageUrl: "",
          x: defaultX + 60,
          y: defaultY + 60,
          width: 80,
          height: 80,
          style: {},
        } as ImageElement,
      ])
      setSelectedId(id)
    }
  }

  // Clamp element position and size to keep margin
  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

  // Image upload for image elements
  const onDrop = (acceptedFiles: File[]) => {
    if (!selectedElement || selectedElement.type !== "image") return
    const file = acceptedFiles[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      updateElement(selectedElement.id, { imageUrl: e.target?.result })
    }
    reader.readAsDataURL(file)
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } })

  // Update background image when URL changes
  React.useEffect(() => {
    if (backgroundImageUrl) {
      setBackgroundImage(backgroundImageUrl)
      setBgOffset({ x: 50, y: 50 }) // Center by default
    } else {
      setBackgroundImage(null)
    }
  }, [backgroundImageUrl])

  return (
    <div className="flex flex-col gap-4 w-full h-full min-w-0 min-h-0">
      {/* Toolbar */}
      <div className="flex gap-2 max-h-full overflow-x-auto min-w-[120px]">
        <button className="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 flex items-center gap-2 whitespace-nowrap" onClick={() => addElement("text")}> <FaPlus /> Text </button>
        <button className="bg-purple-500 hover:bg-purple-600 text-white rounded px-3 py-1 flex items-center gap-2 whitespace-nowrap" onClick={() => addElement("badge")}> <FaPlus /> Badge </button>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded px-3 py-1 flex items-center gap-2 whitespace-nowrap" onClick={() => addElement("icon")}> <FaPlus /> Icon </button>
        <button className="bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1 flex items-center gap-2 whitespace-nowrap" onClick={() => addElement("image")}> <FaPlus /> Image </button>
      </div>
      
      {/* Banner Editor Canvas */}
      <div className="flex-1 flex items-center justify-center min-w-0 min-h-0 bg-gray-50" style={{ borderRadius: 24 }}>
        <div
          className="relative shadow-2xl border border-gray-200 bg-gradient-to-br from-[#a259e6] to-[#5d5fef] rounded-2xl overflow-hidden"
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, padding: CANVAS_PADDING, boxSizing: "content-box", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 24 }}
        >
          {/* Canvas size label */}
          <div className="absolute top-2 right-4 z-20 text-xs bg-black/60 text-white px-2 py-1 rounded shadow">1280 x 320 px</div>
          {/* Background image layer */}
          {backgroundImage && (
            <img
              src={backgroundImage}
              alt="BG"
              className="absolute inset-0 w-full h-full z-0 rounded-2xl"
              style={{
                objectFit: "cover",
                objectPosition: `${bgOffset.x}% ${bgOffset.y}%`,
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          )}
          {/* Floating particles background */}
          <div className="absolute inset-0 z-0 pointer-events-none rounded-2xl">
            <Particles
              id="tsparticles"
              options={{
                fullScreen: false,
                background: { color: "transparent" },
                particles: {
                  number: { value: 12 },
                  color: { value: "#fff" },
                  opacity: { value: 0.12 },
                  size: { value: 60, random: { enable: true, minimumValue: 20 } },
                  move: { enable: true, speed: 1, direction: "none", random: true, straight: false, outModes: { default: "out" } },
                  shape: { type: "circle" },
                },
                detectRetina: true,
              }}
            />
          </div>
          {/* Background image position controls overlayed inside the banner */}
          {backgroundImage && (
            <div className="absolute left-0 right-0 bottom-0 z-30 bg-black/60 px-6 py-4 flex flex-col gap-2 rounded-b-2xl">
              <div className="flex flex-col md:flex-row gap-4 w-full items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1 text-white">Horizontal Position</label>
                  <Slider
                    min={0}
                    max={100}
                    value={[bgOffset.x]}
                    onValueChange={([x]) => setBgOffset(o => ({ ...o, x }))}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1 text-white">Vertical Position</label>
                  <Slider
                    min={0}
                    max={100}
                    value={[bgOffset.y]}
                    onValueChange={([y]) => setBgOffset(o => ({ ...o, y }))}
                  />
                </div>
              </div>
            </div>
          )}
          {/* Draggable/resizable elements */}
          {elements.map((el) => (
            <Rnd
              key={el.id}
              default={{ x: el.x, y: el.y, width: el.width, height: el.height }}
              position={{
                x: clamp(el.x, MIN_MARGIN, CANVAS_WIDTH - el.width - MIN_MARGIN),
                y: clamp(el.y, MIN_MARGIN, CANVAS_HEIGHT - el.height - MIN_MARGIN),
              }}
              size={{ width: el.width, height: el.height }}
              bounds="parent"
              style={{ zIndex: selectedId === el.id ? 10 : 2, ...el.style, position: "absolute", border: selectedId === el.id ? "2px solid #fff" : undefined, boxShadow: selectedId === el.id ? "0 0 0 2px #a259e6" : undefined }}
              enableResizing={el.type !== "icon" ? true : { top:false, right:false, bottom:false, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false }}
              onClick={() => setSelectedId(el.id)}
              onDragStop={(_, d) => updateElement(el.id, {
                x: clamp(d.x, MIN_MARGIN, CANVAS_WIDTH - el.width - MIN_MARGIN),
                y: clamp(d.y, MIN_MARGIN, CANVAS_HEIGHT - el.height - MIN_MARGIN),
              })}
              onResizeStop={(_, __, ref, ___unused, pos) => updateElement(el.id, {
                width: ref.offsetWidth,
                height: ref.offsetHeight,
                x: clamp(pos.x, MIN_MARGIN, CANVAS_WIDTH - ref.offsetWidth - MIN_MARGIN),
                y: clamp(pos.y, MIN_MARGIN, CANVAS_HEIGHT - ref.offsetHeight - MIN_MARGIN),
              })}
            >
              {el.type === "badge" && (
                <div style={{ ...el.style, display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>{el.text}</div>
              )}
              {el.type === "text" && (
                <div style={{ ...el.style, width: "100%", height: "100%", display: "flex", alignItems: "center" }}>{el.text}</div>
              )}
              {el.type === "icon" && (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {(() => {
                    const Icon = getIconComponent(el.icon)
                    return <Icon color="#fff" size={32} style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }} />
                  })()}
                </div>
              )}
              {el.type === "image" && el.imageUrl && (
                <img src={el.imageUrl} alt="Banner" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: 8 }} />
              )}
              {el.type === "image" && !el.imageUrl && (
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}>
                  No Image
                </div>
              )}
            </Rnd>
          ))}
        </div>
      </div>

      {/* Sidebar for editing selected element - now below the canvas */}
      {selectedElement && (
        <div className="bg-white rounded-xl shadow-lg p-4 border">
          <div className="mb-4 font-semibold text-gray-700">Edit Element</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedElement.type === "badge" && (
              <>
                <div>
                  <label className="block text-xs font-medium mb-1">Badge Type</label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={selectedElement.text}
                    onChange={e => updateElement(selectedElement.id, { text: e.target.value })}
                  >
                    {BADGE_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Text Color</label>
                  <input
                    type="color"
                    className="w-full h-8 border rounded"
                    value={selectedElement.style.color}
                    onChange={e => updateElement(selectedElement.id, { style: { color: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Background</label>
                  <input
                    type="color"
                    className="w-full h-8 border rounded"
                    value={selectedElement.style.background}
                    onChange={e => updateElement(selectedElement.id, { style: { background: e.target.value } })}
                  />
                </div>
              </>
            )}
            {selectedElement.type === "text" && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium mb-1">Text</label>
                  <input
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={selectedElement.text}
                    onChange={e => updateElement(selectedElement.id, { text: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Text Color</label>
                  <input
                    type="color"
                    className="w-full h-8 border rounded"
                    value={selectedElement.style.color}
                    onChange={e => updateElement(selectedElement.id, { style: { color: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Font Size</label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={selectedElement.style.fontSize}
                    onChange={e => updateElement(selectedElement.id, { style: { fontSize: Number(e.target.value) } })}
                  >
                    {fontSizes.map(size => <option key={size} value={size}>{size}px</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Font Weight</label>
                  <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={selectedElement.style.fontWeight}
                    onChange={e => updateElement(selectedElement.id, { style: { fontWeight: Number(e.target.value) } })}
                  >
                    {fontWeights.map(weight => <option key={weight} value={weight}>{weight}</option>)}
                  </select>
                </div>
              </>
            )}
            {selectedElement.type === "icon" && (
              <div className="md:col-span-3">
                <label className="block text-xs font-medium mb-1">Icon</label>
                <div className="flex gap-2">
                  {ICONS.map(({ name, Icon }, idx) => (
                    <button
                      key={idx}
                      className={`p-2 rounded border ${selectedElement.icon === name ? "bg-blue-100 border-blue-300" : "bg-gray-50 border-gray-200"}`}
                      onClick={() => updateElement(selectedElement.id, { icon: name })}
                      type="button"
                    >
                      <Icon color="#a259e6" size={24} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedElement.type === "image" && (
              <div className="md:col-span-3">
                <label className="block text-xs font-medium mb-1">Image</label>
                <div {...getRootProps()} className="border border-dashed rounded p-4 text-center cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <span>Drop image here...</span>
                  ) : (
                    <span>Click or drag image to upload</span>
                  )}
                </div>
                {selectedElement.imageUrl && (
                  <img src={selectedElement.imageUrl} alt="Uploaded" className="w-full rounded mt-2" />
                )}
              </div>
            )}
            <div className="md:col-span-3">
              <button
                className="w-full bg-red-100 text-red-600 rounded px-3 py-2 text-sm hover:bg-red-200 border border-red-200"
                onClick={() => {
                  setElements(els => els.filter(el => el.id !== selectedElement.id))
                  setSelectedId(null)
                }}
              >
                Delete Element
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
})

export default BannerEditor 