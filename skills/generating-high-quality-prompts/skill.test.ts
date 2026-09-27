import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const skillUrl = new URL('./SKILL.md', import.meta.url)
const standaloneUrl = new URL('./standalone-prompt.md', import.meta.url)

describe('high-quality prompt generator artifacts', () => {
  it('declares discoverable skill frontmatter', async () => {
    const skill = await readFile(skillUrl, 'utf8')

    expect(skill).toMatch(/^---\nname: generating-high-quality-prompts\n/)
    expect(skill).toMatch(
      /\ndescription: Use when [^\n]+(?:create|write|rewrite|improve|optimize)[^\n]*prompts?/i,
    )
  })

  it.each([
    ['skill', skillUrl],
    ['standalone prompt', standaloneUrl],
  ])(
    '%s enforces the clarification and output contracts',
    async (_name, url) => {
      const contents = await readFile(url, 'utf8')

      expect(contents).toMatch(/up to three|maximum of three/i)
      expect(contents).toMatch(/critical (?:information|details|context)/i)
      expect(contents).toMatch(/exactly one|one ready-to-copy/i)
      expect(contents).toMatch(/fenced code block/i)
      expect(contents).toMatch(/do not execute|never execute/i)
      expect(contents).toMatch(
        /invent(?:ed|ing)? (?:facts|requirements|details|constraints)/i,
      )
    },
  )

  it('keeps the standalone prompt independent of Cursor and Hermes', async () => {
    const prompt = await readFile(standaloneUrl, 'utf8')

    expect(prompt).not.toMatch(/\bCursor\b|\bHermes\b/)
  })
})
