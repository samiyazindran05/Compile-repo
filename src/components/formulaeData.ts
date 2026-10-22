export type Formula = {
  name: string;
  expression: string;
  description: string;
};

export type Topic = {
  name: string;
  category: string;
  formulae: Formula[];
};

export const FORMULAE_DATABASE: Topic[] = [
  {
    name: 'Thermodynamics',
    category: 'Physics',
    formulae: [
      { name: 'First Law of Thermodynamics', expression: 'ΔU = Q - W', description: 'Change in internal energy equals heat added minus work done by the system.' },
      { name: 'Ideal Gas Law', expression: 'PV = nRT', description: 'Relates pressure, volume, temperature, and moles of an ideal gas. R = 8.314 J/(mol·K).' },
      { name: 'Carnot Efficiency', expression: 'η = 1 - T_c / T_h', description: 'Maximum possible efficiency of a heat engine between hot and cold reservoirs.' },
      { name: 'Heat Capacity', expression: 'Q = mcΔT', description: 'Heat energy required to change temperature: mass × specific heat × temperature change.' },
      { name: 'Enthalpy', expression: 'H = U + PV', description: 'Total heat content of a system: internal energy plus pressure × volume.' },
      { name: 'Entropy Change', expression: 'ΔS = Q_rev / T', description: 'Reversible heat transfer divided by temperature gives entropy change.' },
      { name: 'Stefan-Boltzmann Law', expression: 'P = σAeT⁴', description: 'Power radiated by a black body. σ = 5.67×10⁻⁸ W/(m²·K⁴).' },
      { name: 'Gibbs Free Energy', expression: 'G = H - TS', description: 'Energy available to do useful work at constant temperature and pressure.' },
    ],
  },
  {
    name: 'Kinematics',
    category: 'Physics',
    formulae: [
      { name: 'Velocity', expression: 'v = u + at', description: 'Final velocity = initial velocity + acceleration × time.' },
      { name: 'Displacement', expression: 's = ut + ½at²', description: 'Displacement under constant acceleration.' },
      { name: 'Velocity-Displacement', expression: 'v² = u² + 2as', description: 'Relates velocity and displacement without time.' },
      { name: 'Average Velocity', expression: 'v_avg = (u + v) / 2', description: 'Average velocity under constant acceleration.' },
      { name: 'Projectile Range', expression: 'R = v₀²sin(2θ) / g', description: 'Maximum horizontal range of a projectile.' },
      { name: 'Maximum Height', expression: 'H = v₀²sin²(θ) / 2g', description: 'Maximum height reached by a projectile.' },
    ],
  },
  {
    name: 'Electromagnetism',
    category: 'Physics',
    formulae: [
      { name: "Ohm's Law", expression: 'V = IR', description: 'Voltage = current × resistance.' },
      { name: 'Electric Power', expression: 'P = VI = I²R = V²/R', description: 'Power dissipated in a resistor.' },
      { name: "Coulomb's Law", expression: 'F = kq₁q₂ / r²', description: 'Force between two charges. k = 9×10⁹ N·m²/C².' },
      { name: 'Magnetic Force', expression: 'F = qvB sin(θ)', description: 'Force on a moving charge in a magnetic field.' },
      { name: 'Faraday\'s Law', expression: 'ε = -dΦ/dt', description: 'Induced EMF equals negative rate of change of magnetic flux.' },
      { name: 'Capacitance', expression: 'C = Q / V', description: 'Charge stored per unit voltage.' },
    ],
  },
  {
    name: 'Mechanics',
    category: 'Physics',
    formulae: [
      { name: "Newton's Second Law", expression: 'F = ma', description: 'Force = mass × acceleration.' },
      { name: 'Work', expression: 'W = Fd cos(θ)', description: 'Work done by a force over a distance.' },
      { name: 'Kinetic Energy', expression: 'KE = ½mv²', description: 'Energy of motion.' },
      { name: 'Potential Energy', expression: 'PE = mgh', description: 'Gravitational potential energy.' },
      { name: 'Momentum', expression: 'p = mv', description: 'Momentum = mass × velocity.' },
      { name: 'Impulse', expression: 'J = FΔt = Δp', description: 'Impulse equals change in momentum.' },
      { name: 'Torque', expression: 'τ = rF sin(θ)', description: 'Rotational force = lever arm × force × angle.' },
      { name: 'Angular Velocity', expression: 'ω = Δθ / Δt', description: 'Rate of change of angular position.' },
    ],
  },
  {
    name: 'Waves and Optics',
    category: 'Physics',
    formulae: [
      { name: 'Wave Speed', expression: 'v = fλ', description: 'Wave speed = frequency × wavelength.' },
      { name: "Snell's Law", expression: 'n₁sin(θ₁) = n₂sin(θ₂)', description: 'Refraction at an interface between two media.' },
      { name: 'Lens Equation', expression: '1/f = 1/u + 1/v', description: 'Relates focal length, object distance, and image distance.' },
      { name: 'Magnification', expression: 'm = v/u = h_i/h_o', description: 'Ratio of image size to object size.' },
      { name: 'Doppler Effect', expression: "f' = f(v ± v_o)/(v ∓ v_s)", description: 'Frequency shift due to relative motion of source and observer.' },
      { name: 'Young\'s Double Slit', expression: 'Δy = λD/d', description: 'Fringe spacing in double-slit experiment.' },
    ],
  },
  {
    name: 'Calculus',
    category: 'Mathematics',
    formulae: [
      { name: 'Power Rule (Derivative)', expression: 'd/dx[xⁿ] = nxⁿ⁻¹', description: 'Derivative of a power function.' },
      { name: 'Product Rule', expression: '(fg)\' = f\'g + fg\'', description: 'Derivative of a product of two functions.' },
      { name: 'Quotient Rule', expression: "(f/g)' = (f'g - fg') / g²", description: 'Derivative of a quotient of two functions.' },
      { name: 'Chain Rule', expression: 'd/dx[f(g(x))] = f\'(g(x))·g\'(x)', description: 'Derivative of a composite function.' },
      { name: 'Integration by Parts', expression: '∫u dv = uv - ∫v du', description: 'Technique for integrating products.' },
      { name: 'Fundamental Theorem', expression: '∫ₐᵇ f(x)dx = F(b) - F(a)', description: 'Links differentiation and integration.' },
      { name: 'Taylor Series', expression: 'f(x) = Σ f⁽ⁿ⁾(a)/n! · (x-a)ⁿ', description: 'Power series expansion of a function.' },
    ],
  },
  {
    name: 'Algebra',
    category: 'Mathematics',
    formulae: [
      { name: 'Quadratic Formula', expression: 'x = (-b ± √(b²-4ac)) / 2a', description: 'Solutions to ax² + bx + c = 0.' },
      { name: 'Discriminant', expression: 'Δ = b² - 4ac', description: 'Determines nature of roots: positive = two real, zero = one real, negative = two complex.' },
      { name: 'Binomial Theorem', expression: '(a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏbᵏ', description: 'Expansion of a binomial raised to a power.' },
      { name: 'Arithmetic Sequence', expression: 'aₙ = a₁ + (n-1)d', description: 'nth term of an arithmetic sequence.' },
      { name: 'Geometric Sequence', expression: 'aₙ = a₁ · rⁿ⁻¹', description: 'nth term of a geometric sequence.' },
      { name: 'Logarithm Rule', expression: 'logₐ(xy) = logₐ(x) + logₐ(y)', description: 'Product rule for logarithms.' },
    ],
  },
  {
    name: 'Trigonometry',
    category: 'Mathematics',
    formulae: [
      { name: 'Pythagorean Identity', expression: 'sin²θ + cos²θ = 1', description: 'Fundamental trigonometric identity.' },
      { name: 'Sum Formula', expression: 'sin(A+B) = sinAcosB + cosAsinB', description: 'Sine of a sum of two angles.' },
      { name: 'Double Angle', expression: 'sin(2θ) = 2sinθcosθ', description: 'Sine of double an angle.' },
      { name: 'Law of Sines', expression: 'a/sinA = b/sinB = c/sinC', description: 'Relates sides and angles in any triangle.' },
      { name: 'Law of Cosines', expression: 'c² = a² + b² - 2ab·cosC', description: 'Generalized Pythagorean theorem for any triangle.' },
      { name: 'Area of Triangle', expression: 'A = ½ab·sinC', description: 'Area using two sides and included angle.' },
    ],
  },
  {
    name: 'Probability and Statistics',
    category: 'Mathematics',
    formulae: [
      { name: 'Mean', expression: 'μ = Σxᵢ / n', description: 'Arithmetic average of a dataset.' },
      { name: 'Variance', expression: 'σ² = Σ(xᵢ - μ)² / n', description: 'Average squared deviation from the mean.' },
      { name: 'Standard Deviation', expression: 'σ = √(σ²)', description: 'Square root of variance; measures data spread.' },
      { name: 'Bayes\' Theorem', expression: 'P(A|B) = P(B|A)·P(A) / P(B)', description: 'Updates probability based on new evidence.' },
      { name: 'Combinations', expression: 'C(n,r) = n! / (r!(n-r)!)', description: 'Number of ways to choose r items from n.' },
      { name: 'Permutations', expression: 'P(n,r) = n! / (n-r)!', description: 'Number of ordered arrangements of r items from n.' },
      { name: 'Binomial Probability', expression: 'P(X=k) = C(n,k)pᵏ(1-p)ⁿ⁻ᵏ', description: 'Probability of k successes in n trials.' },
    ],
  },
  {
    name: 'Chemical Bonding',
    category: 'Chemistry',
    formulae: [
      { name: 'Formal Charge', expression: 'FC = V - (L + ½B)', description: 'V = valence electrons, L = lone pairs, B = bonding electrons.' },
      { name: 'Dipole Moment', expression: 'μ = q × d', description: 'Charge magnitude × separation distance.' },
      { name: 'Bond Order', expression: 'BO = (N_b - N_a) / 2', description: 'Half the difference between bonding and antibonding electrons.' },
      { name: 'Electronegativity Difference', expression: 'ΔEN = |χ_A - χ_B|', description: 'Determines bond polarity between two atoms.' },
      { name: 'Lattice Energy', expression: 'U ∝ (q⁺·q⁻) / r', description: 'Energy holding ions together in a lattice; proportional to charge product over distance.' },
    ],
  },
  {
    name: 'Stoichiometry',
    category: 'Chemistry',
    formulae: [
      { name: 'Moles', expression: 'n = m / M', description: 'Moles = mass / molar mass.' },
      { name: 'Molarity', expression: 'M = n / V', description: 'Concentration = moles of solute / liters of solution.' },
      { name: 'Percent Composition', expression: '% = (mass of element / total mass) × 100', description: 'Mass percentage of an element in a compound.' },
      { name: 'Empirical Formula', expression: 'Ratio = n / smallest n', description: 'Simplest whole-number ratio of atoms in a compound.' },
      { name: 'Gas Stoichiometry', expression: 'n = PV / RT', description: 'Moles of gas from pressure, volume, and temperature.' },
      { name: 'Limiting Reagent', expression: 'n_rxn = n / stoichiometric coefficient', description: 'The reactant with the lowest n/coefficient ratio is limiting.' },
    ],
  },
  {
    name: 'Organic Chemistry',
    category: 'Chemistry',
    formulae: [
      { name: 'General Alkane', expression: 'CₙH₂ₙ₊₂', description: 'Formula for saturated hydrocarbons.' },
      { name: 'General Alkene', expression: 'CₙH₂ₙ', description: 'Formula for hydrocarbons with one double bond.' },
      { name: 'General Alkyne', expression: 'CₙH₂ₙ₋₂', description: 'Formula for hydrocarbons with one triple bond.' },
      { name: 'Degree of Unsaturation', expression: 'DBE = (2C + 2 - H) / 2', description: 'Double bond equivalent; rings plus pi bonds.' },
      { name: 'Markovnikov\'s Rule', expression: 'H adds to C with more H', description: 'In addition reactions, H goes to the less substituted carbon.' },
    ],
  },
];
