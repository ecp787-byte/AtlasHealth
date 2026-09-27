// Dynamic repeatable list of ages for additional household members. The
// quiz doesn't ask "how many" as a separate question - it just lets the
// person add a row per person, which is faster on mobile than a number
// picker followed by N separate age screens.
export default function StepDependentAges({ value, onChange }) {
  const ages = Array.isArray(value) ? value : [''];

  function setAge(index, age) {
    const digits = age.replace(/\D/g, '').slice(0, 3);
    const next = [...ages];
    next[index] = digits;
    onChange(next);
  }

  function addRow() {
    onChange([...ages, '']);
  }

  function removeRow(index) {
    const next = ages.filter((_, i) => i !== index);
    onChange(next.length ? next : ['']);
  }

  return (
    <div className="quiz-dependent-ages">
      {ages.map((age, i) => (
        <div className="quiz-dependent-row" key={i}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            className="quiz-input"
            placeholder={`Person ${i + 2} age`}
            value={age}
            onChange={(e) => setAge(i, e.target.value)}
          />
          {ages.length > 1 && (
            <button
              type="button"
              className="quiz-dependent-remove"
              onClick={() => removeRow(i)}
              aria-label="Remove"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" className="quiz-add-dependent" onClick={addRow}>
        + Add another person
      </button>
    </div>
  );
}

export function dependentAgesValid(ages) {
  if (!Array.isArray(ages) || ages.length === 0) return false;
  return ages.every((a) => {
    const n = parseInt(a, 10);
    return Number.isInteger(n) && n >= 0 && n <= 120;
  });
}
