// ESLint rule for Svelte components: user-facing text must come from translation files (UI-01).
// Reports text nodes and user-facing attributes (title, placeholder, alt, aria-*) that contain
// letters written directly in the markup.

/** Attributes whose value is shown to the user or read by assistive technology. */
const TEXT_ATTRIBUTES = new Set(['title', 'placeholder', 'alt', 'label']);

const LETTER = /\p{L}/u;

/**
 * @param {string} name
 */
function isTextAttribute(name) {
  return TEXT_ATTRIBUTES.has(name) || name.startsWith('aria-');
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow untranslated text in Svelte markup (use the i18n t() function).',
    },
    messages: {
      rawText: 'Untranslated text "{{text}}". Use t() with a key from the translation files.',
    },
    schema: [],
  },
  create(context) {
    /**
     * @param {any} node
     * @param {string} value
     */
    function check(node, value) {
      if (LETTER.test(value)) {
        context.report({ node, messageId: 'rawText', data: { text: value.trim() } });
      }
    }

    return {
      /** @param {any} node */
      SvelteText(node) {
        // Text inside <style> and <script> is not markup.
        const parentName = node.parent?.name?.name;
        if (parentName === 'style' || parentName === 'script') return;
        check(node, node.value);
      },
      /** @param {any} node */
      SvelteAttribute(node) {
        if (!isTextAttribute(node.key.name)) return;
        for (const part of node.value) {
          if (part.type === 'SvelteLiteral') check(part, part.value);
        }
      },
    };
  },
};

export default rule;
