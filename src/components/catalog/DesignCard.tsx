import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Design } from '@/types/design'

interface DesignCardProps {
  design: Design
}

export function DesignCard({ design }: DesignCardProps) {
  return (
    <Card className="group hover:shadow-md transition-all duration-300">
      <Link to={design.detailUrl} className="block">
        <div className="relative aspect-video w-full overflow-hidden bg-muted/50">
          <img
            src={design.thumbnailUrl}
            alt={design.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
