export function calculateTMB(weight: number, height: number, age: number, sex: 'M' | 'F'): number {
  if (sex === 'M') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
  }
  return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age
}

export function calculateDailyCalories(tmb: number, goal: 'lose' | 'maintain' | 'gain'): number {
  const multipliers = {
    lose: 1.2,
    maintain: 1.4,
    gain: 1.7,
  }
  return Math.round(tmb * multipliers[goal])
}
