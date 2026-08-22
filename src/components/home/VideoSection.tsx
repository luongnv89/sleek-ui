export function VideoSection() {
  return (
    <section className="border-t border-border/60 px-4 py-14 sm:py-16 bg-muted/20">
      <div className="mx-auto max-w-4xl text-center space-y-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Watch it transform a real app</h2>
          <p className="mt-2 text-muted-foreground">One URL. One prompt. The agent rewrites the entire interface.</p>
        </div>
        <div className="rounded-xl overflow-hidden border border-border shadow-lg">
          <video
            src="/sleek-ui/promotional-video.mp4"
            poster="/sleek-ui/promotional-video-poster.svg"
            preload="metadata"
            controls
            muted
            loop
            playsInline
            className="w-full aspect-video"
          />
        </div>
      </div>
    </section>
  );
}
