// Small helper so call sites read <Icon name="i-shield" /> instead of
// repeating the <svg><use/></svg> boilerplate everywhere.
export default function Icon({ name, className = 'icon', style }) {
  return (
    <svg className={className} style={style}>
      <use href={`#${name}`} />
    </svg>
  );
}
