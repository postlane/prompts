Postlane solves a friction I hit repeatedly: after shipping something, drafting the social post takes longer than writing the code did. You have to context-switch to a browser, re-explain your writing style, resize content for each platform, and remember where the scheduler lives. Postlane moves that entire flow into your IDE.

The approach I'm most interested in feedback on is the voice guide — a short markdown file in your repo that describes your writing style. It gets injected into every prompt so you don't re-establish tone each session. Treating writing style as version-controlled configuration rather than a per-conversation instruction felt like the right abstraction, but I'm not sure if it matches how developers actually think about their online voice.

This is a side project I built after doing the manual version about forty times. It works well for my own repos now but I'm sure there are edge cases in the git range detection and scheduler integration that only show up at scale.

Postlane is free to try with npx @postlane/cli init. The CLI and prompt library are MIT. The desktop app has a free tier. If you ship projects and post about them, I'd genuinely like to know whether this matches your workflow.
