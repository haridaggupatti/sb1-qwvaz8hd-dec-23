export class TranscriptManager {
  private transcripts: string[] = [];

  append(transcript: string) {
    this.transcripts.push(transcript);
  }

  clear() {
    this.transcripts = [];
  }

  getCurrentText() {
    return this.transcripts.join(' ').trim();
  }

  getFullTranscript(interim?: string) {
    const base = this.getCurrentText();
    return interim ? `${base} ${interim}`.trim() : base;
  }
}