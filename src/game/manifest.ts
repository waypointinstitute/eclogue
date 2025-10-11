export interface ManifestRequest {
  artifactId: string;
  durationSec: number;
}

export function requestManifest(_request: ManifestRequest) {
  // Placeholder for future waking-world artifact manifests
  console.info('Manifest request registered');
}
