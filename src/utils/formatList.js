const formatList = (wishes, title) => {
  const lines = wishes.map((w, i) =>
    [
      `${i + 1}. *${w.name}* — @${w.username || w.userId}`,
      w.description ? `   _${w.description}_` : null,
      `   🆔 \`${w.id}\``,
    ].filter(Boolean).join('\n')
  );
  return `🎁 *${title}:*\n\n${lines.join('\n\n')}`;
};

module.exports = { formatList };
