#!/usr/bin/env node

import { runSeoAudit } from '../src/lib/seo-auditor/auditor'
import { ingestPage } from '../src/lib/seo-auditor/ingest'
import { createLangChainSeoAnalyzer } from '../src/lib/seo-auditor/langchain'

function usage(): string {
  return `Usage: pnpm seo:audit -- <url> [--llm] [--pretty] [--allow-private]

Options:
  --llm            Add LangChain analysis (requires OPENAI_API_KEY)
  --pretty         Pretty-print the JSON report
  --allow-private  Allow loopback/private targets (unsafe for untrusted URLs)
  --help           Show this help`
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  if (args.includes('--help') || args.includes('-h')) {
    console.log(usage())
    return
  }

  const knownFlags = new Set(['--llm', '--pretty', '--allow-private'])
  const unknownFlag = args.find(
    (arg) => arg.startsWith('-') && !knownFlags.has(arg),
  )
  if (unknownFlag)
    throw new Error(`Unknown option: ${unknownFlag}\n\n${usage()}`)

  const url = args.find((arg) => !arg.startsWith('-'))
  if (!url) {
    throw new Error(usage())
  }

  const page = await ingestPage(url, {
    allowPrivateHosts: args.includes('--allow-private'),
  })
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
