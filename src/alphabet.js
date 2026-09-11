export const UPPER = [
  ["Α", "alfa"],
  ["Β", "beta"],
  ["Γ", "gamma"],
  ["Δ", "delta"],
  ["Ε", "epsilon"],
  ["Ζ", "zeta"],
  ["Η", "eta"],
  ["Θ", "theta"],
  ["Ι", "iota"],
  ["Κ", "kappa"],
  ["Λ", "lambda"],
  ["Μ", "mu"],
  ["Ν", "nu"],
  ["Ξ", "xi"],
  ["Ο", "omicron"],
  ["Π", "pi"],
  ["Ρ", "rho"],
  ["Σ", "sigma"],
  ["Τ", "tau"],
  ["Υ", "upsilon"],
  ["Φ", "phi"],
  ["Χ", "chi"],
  ["Ψ", "psi"],
  ["Ω", "omega"],
].map(([letter, name], index) => ({ letter, name, index, case: "upper" }));

export const LOWER = [
  ["α", "alfa"],
  ["β", "beta"],
  ["γ", "gamma"],
  ["δ", "delta"],
  ["ε", "epsilon"],
  ["ζ", "zeta"],
  ["η", "eta"],
  ["θ", "theta"],
  ["ι", "iota"],
  ["κ", "kappa"],
  ["λ", "lambda"],
  ["μ", "mu"],
  ["ν", "nu"],
  ["ξ", "xi"],
  ["ο", "omicron"],
  ["π", "pi"],
  ["ρ", "rho"],
  ["σ", "sigma"],
  ["τ", "tau"],
  ["υ", "upsilon"],
  ["φ", "phi"],
  ["χ", "chi"],
  ["ψ", "psi"],
  ["ω", "omega"],
].map(([letter, name], index) => ({ letter, name, index, case: "lower" }));

export const ALL_LETTERS = [...UPPER, ...LOWER];

export function getPool(caseMode) {
  if (caseMode === "upper") return UPPER;
  if (caseMode === "lower") return LOWER;
  return ALL_LETTERS;
}
