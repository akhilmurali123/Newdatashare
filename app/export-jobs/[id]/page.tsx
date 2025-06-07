export async function generateStaticParams() {
  // For static export, we'll generate a few example IDs
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}

export default function ExportJobPage({ params }: { params: { id: string } }) {
  // ... existing code ...
} 