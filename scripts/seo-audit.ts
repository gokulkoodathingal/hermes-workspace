#!/usr/bin/env node

import { runSeoAudit } from '../src/lib/seo-auditor/auditor'
import { ingestPage } from '../src/lib/seo-auditor/ingest'
import { createLangChainSeoAnalyzer } from '../src/lib/seo-auditor/langchain'

function usage(): string {
  return `Usage: pnpm seo:audit -- <url> [--llm] [--pretty]

Options:
  --llm     Add LangChain analysis (requires OPENAI_API_KEY)
  --pretty  Pretty-print the JSON report
  --help    Show this help`
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    console.log(usage())
    return
  }

  const url = args.find((arg) => !arg.startsWith('-'))
  if (!url) {
    throw new Error(usage())
  }

  const page = await ingestPage(url)
  const analyzer = args.includes('--llm')
    ? createLangChainSeoAnalyzer()
    : undefined
  const report = await runSeoAudit(page, { analyzer })
  console.log(JSON.stringify(report, null, args.includes('--pretty') ? 2 : 0))
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
