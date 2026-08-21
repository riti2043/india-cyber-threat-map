export type PuzzleType = 'MCQPuzzle' | 'SpotTheObjectPuzzle' | 'MatchPuzzle' | 'SequencePuzzle';

export interface LevelConfig {
  id: number;
  title: string;
  puzzleType: PuzzleType;
  puzzleData: any; // We'll type this strictly later if needed
  startPos: { x: number, y: number };
  interactablePos: { x: number, y: number };
  exitPos: { x: number, y: number };
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "The Phishing Pond",
    puzzleType: "SpotTheObjectPuzzle",
    puzzleData: {
      items: [
        { id: 1, type: "legit", text: "Weekly Newsletter" },
        { id: 2, type: "legit", text: "Meeting Invite" },
        { id: 3, type: "legit", text: "Project Update" },
        { id: 4, type: "phishing", text: "URGENT: Verify your account immediately! - admin@paypal-support.net" },
        { id: 5, type: "legit", text: "Happy Birthday!" },
        { id: 6, type: "legit", text: "Invoice #1234" },
      ],
      correctTargetId: 4
    },
    startPos: { x: 2, y: 5 },
    interactablePos: { x: 5, y: 5 },
    exitPos: { x: 8, y: 5 },
  },
  {
    id: 2,
    title: "The Password Vault",
    puzzleType: "MCQPuzzle",
    puzzleData: {
      question: "Which of these passwords would take a hacker the longest to crack?",
      options: [
        "Password123!",
        "Tr0ub4dor&3",
        "correct-horse-battery-staple-92",
        "Summer2024"
      ],
      correctAnswerIndex: 2
    },
    startPos: { x: 2, y: 5 },
    interactablePos: { x: 5, y: 5 },
    exitPos: { x: 8, y: 5 },
  },
  {
    id: 3,
    title: "The Social Engineer's Trap",
    puzzleType: "MatchPuzzle",
    puzzleData: {
      leftSide: [
        { id: "urgency", text: "Urgency" },
        { id: "authority", text: "Authority" },
        { id: "trust", text: "Trust exploitation" },
        { id: "curiosity", text: "Curiosity" }
      ],
      rightSide: [
        { id: "m1", text: "Your account will be deleted in 1 hour!" },
        { id: "m2", text: "This is your CEO, send the wire transfer now" },
        { id: "m3", text: "Fake IT support calling about a 'virus'" },
        { id: "m4", text: "You won't believe what's on this USB drive" }
      ],
      correctPairs: {
        "urgency": "m1",
        "authority": "m2",
        "trust": "m3",
        "curiosity": "m4"
      }
    },
    startPos: { x: 2, y: 5 },
    interactablePos: { x: 5, y: 5 },
    exitPos: { x: 8, y: 5 },
  },
  {
    id: 4,
    title: "The Malware Menagerie",
    puzzleType: "MatchPuzzle",
    puzzleData: {
      leftSide: [
        { id: "ransomware", text: "Ransomware" },
        { id: "spyware", text: "Spyware" },
        { id: "worm", text: "Worm" },
        { id: "trojan", text: "Trojan" }
      ],
      rightSide: [
        { id: "m1", text: "Encrypts your files, demands payment" },
        { id: "m2", text: "Silently monitors your activity" },
        { id: "m3", text: "Self-replicates across networks without user action" },
        { id: "m4", text: "Disguises itself as legitimate software" }
      ],
      correctPairs: {
        "ransomware": "m1",
        "spyware": "m2",
        "worm": "m3",
        "trojan": "m4"
      }
    },
    startPos: { x: 2, y: 5 },
    interactablePos: { x: 5, y: 5 },
    exitPos: { x: 8, y: 5 },
  },
  {
    id: 5,
    title: "The Link Labyrinth",
    puzzleType: "SpotTheObjectPuzzle",
    puzzleData: {
      items: [
        { id: 1, type: "legit", text: "google.com" },
        { id: 2, type: "legit", text: "github.com" },
        { id: 3, type: "legit", text: "microsoft.com" },
        { id: 4, type: "legit", text: "apple.com" },
        { id: 5, type: "fake", text: "arnazon.com" },
        { id: 6, type: "legit", text: "netflix.com" }
      ],
      correctTargetId: 5
    },
    startPos: { x: 2, y: 5 },
    interactablePos: { x: 5, y: 5 },
    exitPos: { x: 8, y: 5 },
  },
  {
    id: 6,
    title: "The Breach Response Chamber",
    puzzleType: "SequencePuzzle",
    puzzleData: {
      items: [
        { id: "s1", text: "Contain the breach (isolate affected systems)" },
        { id: "s2", text: "Assess the damage/scope" },
        { id: "s3", text: "Notify affected parties" },
        { id: "s4", text: "Patch the vulnerability" },
        { id: "s5", text: "Review and improve defenses" }
      ],
      // We shuffle these in the component
      correctOrder: ["s1", "s2", "s3", "s4", "s5"]
    },
    startPos: { x: 2, y: 5 },
    interactablePos: { x: 5, y: 5 },
    exitPos: { x: 8, y: 5 },
  },
  {
    id: 7,
    title: "The Encryption Chamber",
    puzzleType: "MCQPuzzle",
    puzzleData: {
      question: "Why is HTTPS more secure than HTTP for sending sensitive data?",
      options: [
        "It encrypts data in transit between browser and server",
        "It makes websites load faster",
        "It blocks all viruses",
        "It's required by every website"
      ],
      correctAnswerIndex: 0
    },
    startPos: { x: 2, y: 5 },
    interactablePos: { x: 5, y: 5 },
    exitPos: { x: 8, y: 5 },
  },
  {
    id: 8,
    title: "The Final Gate: MFA Boss Room",
    puzzleType: "MCQPuzzle",
    puzzleData: {
      question: "You get a login alert with a 2FA code you didn't request. What should you do?",
      options: [
        "Enter the code so the app stops bothering you",
        "Ignore it, it'll go away",
        "Deny the request and immediately change your password",
        "Forward the code to IT over email"
      ],
      correctAnswerIndex: 2
    },
    startPos: { x: 2, y: 5 },
    interactablePos: { x: 5, y: 5 },
    exitPos: { x: 8, y: 5 },
  }
];
