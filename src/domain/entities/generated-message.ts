/**
 * Result entity produced by domain after generation
 */
export class GeneratedMessage {
    constructor(
        public readonly text: string,
        public readonly image?: Buffer,
        public readonly metadata?: {
            type: string;
            topic: string;
        }
    ) { }
}
