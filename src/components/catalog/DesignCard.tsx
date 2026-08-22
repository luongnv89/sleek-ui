import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { TransformedDesign } from '@/types/design'

interface DesignCardProps {
  design: TransformedDesign
}

function ColorSwatchPreview({ design }: { design: TransformedDesign }) {
  const mode = design.defaultMode
  const colors = design.rawData?.tokens?.colors?.[mode] ?? design.rawData?.tokens?.colors?.light ?? {}
  const hsl = (key: string, fallback: string) =>
    colors[key] ? `hsl(${colors[key]})` : fallback

  const bg = hsl('background', 'hsl(0 0% 96%)')
  const fg = hsl('foreground', 'hsl(0 0% 10%)')
  const primary = hsl('primary', 'hsl(240 90% 60%)')
  const secondary = hsl('secondary', 'hsl(0 0% 85%)')
  const accent = hsl('accent', primary)
  const muted = hsl('muted', 'hsl(0 0% 90%)')
  const border = hsl('border', 'hsl(0 0% 80%)')

  const mainSwatches = [
    { label: 'bg', color: bg },
    { label: 'primary', color: primary },
    { label: 'secondary', color: secondary },
  ]
  const subSwatches = [
    { label: 'accent', color: accent },
    { label: 'muted', color: muted },
    { label: 'fg', color: fg },
  ]

  return (
    <div className="h-full w-full flex flex-col p-4 gap-3" style={{ background: bg, borderBottom: `1px solid ${border}` }}>
      <div className="flex gap-2 flex-1">
        {mainSwatches.map(({ label, color }) => (
          <div key={label} className="flex-1 flex flex-col gap-1">
            <div className="flex-1 rounded-lg" style={{ background: color, minHeight: 48, border: `1px solid ${border}` }} />
            <span className="text-[9px] text-center truncate" style={{ color: fg, opacity: 0.5 }}>{label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {subSwatches.map(({ label, color }) => (
          <div key={label} className="flex-1 flex flex-col gap-1">
            <div className="rounded" style={{ background: color, height: 24, border: `1px solid ${border}` }} />
            <span className="text-[9px] text-center truncate" style={{ color: fg, opacity: 0.5 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DesignCard({ design }: DesignCardProps) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <Card className="group hover:shadow-md transition-all duration-300">
      <Link to={design.detailUrl} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-muted/50">
          {!imgFailed ? (
            <img
              src={design.thumbnailUrl}
              alt={design.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <ColorSwatchPreview design={design} />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardHeader className="p-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg tracking-tight">{design.name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {design.description}
          </p>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex flex-wrap gap-2">
            {design.categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
