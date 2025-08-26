// Seeded random number generator for deterministic question generation
class SeededRandom {
  private seed: number;
  
  constructor(seed: string) {
    // Convert string seed to number
    this.seed = this.hashCode(seed);
  }
  
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export interface DeterministicProblem {
  id: string;
  question: string;
  correctAnswer: boolean;
  index: number;
}

export function generateDeterministicProblems(seed: string, count: number): DeterministicProblem[] {
  const rng = new SeededRandom(seed);
  const problems: DeterministicProblem[] = [];
  
  for (let i = 0; i < count; i++) {
    const operation = rng.nextInt(0, 3); // 0: +, 1: -, 2: *, 3: /
    let num1: number, num2: number, result: number, displayResult: number;
    let question: string;
    
    switch (operation) {
      case 0: // Addition
        num1 = rng.nextInt(1, 50);
        num2 = rng.nextInt(1, 50);
        result = num1 + num2;
        displayResult = rng.next() > 0.5 ? result : result + rng.nextInt(-5, 5);
        question = `${num1} + ${num2} = ${displayResult}`;
        break;
        
      case 1: // Subtraction
        num1 = rng.nextInt(10, 100);
        num2 = rng.nextInt(1, num1);
        result = num1 - num2;
        displayResult = rng.next() > 0.5 ? result : result + rng.nextInt(-5, 5);
        question = `${num1} - ${num2} = ${displayResult}`;
        break;
        
      case 2: // Multiplication
        num1 = rng.nextInt(2, 12);
        num2 = rng.nextInt(2, 12);
        result = num1 * num2;
        displayResult = rng.next() > 0.5 ? result : result + rng.nextInt(-10, 10);
        question = `${num1} × ${num2} = ${displayResult}`;
        break;
        
      case 3: // Division
        num2 = rng.nextInt(2, 12);
        result = rng.nextInt(1, 12);
        num1 = num2 * result;
        displayResult = rng.next() > 0.5 ? result : result + rng.nextInt(-3, 3);
        question = `${num1} ÷ ${num2} = ${displayResult}`;
        break;
        
      default:
        num1 = rng.nextInt(1, 50);
        num2 = rng.nextInt(1, 50);
        result = num1 + num2;
        displayResult = result;
        question = `${num1} + ${num2} = ${displayResult}`;
    }
    
    problems.push({
      id: `${seed}-${i}`,
      question,
      correctAnswer: displayResult === result,
      index: i
    });
  }
  
  return problems;
}