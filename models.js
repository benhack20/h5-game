export const modelRanks = [
  {
    name: "Qwen1.5-0.5B",
    min: 0,
    description: "2024年2月6日发布。通义千问的迷你版本，仅0.5B参数，却支持高达32768个tokens的上下文长度，多语言任务表现出色，是入门AI的绝佳选择！"
  },
  {
    name: "Mistral 7B",
    min: 5,
    description: "Mistral AI团队发布的73亿参数模型，在所有基准测试中均优于Llama 2 13B，并在许多基准测试中优于Llama 1 34B。它接近CodeLlama 7B在代码方面的性能，同时在英语任务上保持良好表现。使用分组查询注意力（GQA）实现更快的推理，并使用滑动窗口注意力（SWA）以较低成本处理更长序列。在Apache 2.0许可下发布，可以无限制地使用。"
  },
  {
    name: "Gemma 3-4B",
    min: 10,
    description: "Google DeepMind开发的轻量级开放模型，支持文本和图像输入。具有128K上下文窗口，支持140多种语言，适合各种文本生成和图像理解任务。相对较小的尺寸使其可以在资源有限的环境中部署，如笔记本电脑、台式机或云基础设施，让更多人能够使用最先进的AI模型。"
  },
  {
    name: "DeepSeek-V3-7B",
    min: 15,
    description: "DeepSeek-V3的蒸馏版本。DeepSeek-V3是DeepSeek AI发布的MoE模型，671B参数，激活37B，在14.8T token上进行了预训练。在多项评测中超越了Qwen2.5-72B和Llama-3.1-405B，性能接近GPT-4o和Claude-3.5-Sonnet。在知识类任务（MMLU, MMLU-Pro, GPQA, SimpleQA）上的水平相比前代显著提升，接近当前表现最好的模型。"
  },
  {
    name: "ChatGLM3-6B",
    min: 20,
    description: "ChatGLM系列最新一代开源模型，保留了前两代模型对话流畅、部署门槛低等优秀特性。基础模型采用了更多样的训练数据、更充分的训练步数和更合理的训练策略。在语义、数学、推理、代码、知识等不同角度的数据集上测评显示，具有在10B以下的预训练模型中最强的性能。"
  },
  {
    name: "Llama 3-8B",
    min: 25,
    description: "Meta开发的预训练和指令调整生成文本模型，针对对话用例进行了优化。在常见的行业基准测试中优于许多可用的开源聊天模型。使用监督式微调（SFT）和人类反馈的强化学习（RLHF）来提升帮助性和安全性。基于优化的Transformer架构，是一个自回归语言模型。"
  },
  {
    name: "DeepSeek-V3-13B",
    min: 30,
    description: "DeepSeek-V3的蒸馏版本。DeepSeek-V3为MoE模型，671B参数，激活37B，在14.8T token上进行了预训练。在多项评测中超越了Qwen2.5-72B和Llama-3.1-405B，性能接近GPT-4o和Claude-3.5-Sonnet。在长文本测评中，DROP、FRAMES和LongBench v2上，平均表现超越其他模型。"
  },
  {
    name: "DeepSeek-Coder-33B",
    min: 40,
    description: "DeepSeek开发的330亿参数模型，专注于代码生成和软件开发。在2万亿tokens上训练，包括87%的代码和13%的英语和中文自然语言。支持代码补全、错误修复、代码解释和文档生成，在各种基准测试中实现了最先进的性能。适合部署于开发者工具、IDE集成、研究和企业软件工程系统。"
  },
  {
    name: "Qwen3-32B",
    min: 50,
    description: "Qwen3系列大型语言模型，32.8B参数（非嵌入参数为31.2B），64层，注意力头数为Q头64个，KV头8个。支持32,768个token上下文长度，使用YaRN可达131,072个token。在推理、指令跟随、代理能力和多语言支持方面表现出色，适用于复杂逻辑推理、数学、编程和多轮对话等任务。"
  },
  {
    name: "DeepSeek-V3-70B",
    min: 60,
    description: "DeepSeek-V3的蒸馏版本。DeepSeek-V3为MoE模型，671B参数，激活37B，在14.8T token上进行了预训练。在算法类代码场景（Codeforces）领先于市面上已有的全部非o1类模型，在工程类代码场景（SWE-Bench Verified）逼近Claude-3.5-Sonnet-1022。"
  },
  {
    name: "Llama 3-70B",
    min: 70,
    description: "Meta开发的700亿参数多语言大模型，基于优化的Transformer架构，支持128K上下文长度。经过预训练和指令微调，擅长推理、代码生成和多语言对话。使用分组查询注意力（GQA）提高推理速度，通过强化学习和人类反馈优化模型性能。"
  },
  {
    name: "Qwen3-72B",
    min: 80,
    description: "阿里云推出的720亿参数大语言模型，在超过3万亿tokens的数据上进行预训练，涵盖中英文、多语言文本、代码和数学等领域。支持32k上下文长度，具有强大的性能和广泛的词汇覆盖。基于此模型还推出了Qwen-72B-Chat AI助手。"
  },
  {
    name: "GPT-3.5 Turbo",
    min: 90,
    description: "OpenAI开发的高效模型，适用于各种自然语言处理任务。支持4096个token的上下文，可通过微调来提高特定任务的性能。在保持高质量输出的同时，具有更快的响应速度和更低的成本。"
  },
  {
    name: "GPT-4",
    min: 100,
    description: "OpenAI的生成式预训练模型，性能卓越。在逻辑推理、数学计算和代码生成等任务上表现出色，能够处理更复杂的任务。支持多模态输入，具有强大的上下文理解能力和创造性思维。"
  },
  {
    name: "GPT-4 Turbo",
    min: 120,
    description: "GPT-4的高效版本，在速度和成本上进行了优化，同时保持了与GPT-4类似的性能。支持更长的上下文窗口，适用于高频率的推理任务。在保持高质量输出的同时，显著提升了响应速度。"
  },
  {
    name: "GPT-4o",
    min: 140,
    description: "OpenAI 2024年5月发布的多模态AI模型，支持文本、图像和音频输入。与GPT-4 Turbo相比，它更快、更便宜、更高效。在保持强大性能的同时，显著降低了使用成本，适合大规模部署。"
  },
  {
    name: "Claude 3.5 Sonnet",
    min: 160,
    description: "Anthropic开发的先进大语言模型，在研究生水平推理（GPQA）、本科水平知识（MMLU）和编码能力（HumanEval）上表现出色。支持视觉推理任务，能够解释图表、图形和复杂的视觉数据。运行速度是前代模型的两倍，成本效益高，在内部评估中解决64%的编码问题。"
  },
  {
    name: "Claude 3.7 Sonnet",
    min: 180,
    description: "Anthropic 2025年2月推出的AI模型，采用混合推理方法，能够根据任务需求选择快速直觉型回答或谨慎逐步推理。在编码、内容创作和复杂推理方面表现出色，相比前代产品有显著提升。支持更长的上下文理解和更复杂的任务处理。"
  },
  {
    name: "Claude 4 Sonnet",
    min: 200,
    description: "Anthropic开发的多功能AI助手，专为编码、复杂问题解决和代理能力而设计。支持64K输出token，提供混合推理模式，在编码、调试和长上下文理解方面表现出色。成本效益高，适用于广泛的任务，能够与工具集成以提升性能。"
  },
  {
    name: "Claude 4 Opus",
    min: 220,
    description: "Anthropic的最新AI模型，在编码、代理搜索和创意写作方面表现出色。在SWE-bench和Terminal-bench等基准测试中领先，支持32K输出token。提供混合推理、扩展思考和高级记忆能力，适合复杂且长期的任务。"
  },
  {
    name: "Qwen3-235B(Reasoning)",
    min: 240,
    description: "Qwen系列最新一代大语言模型，在推理、遵循指令、代理能力和多语言支持方面都有显著进步。支持思维模式（用于复杂任务）和非思维模式（用于普通对话）之间的无缝切换。在数学、代码生成和常识逻辑推理方面表现出色，支持超过100种语言。"
  },
  {
    name: "Gemini 2.5 Flash",
    min: 255,
    description: "谷歌DeepMind的多模态推理模型，适用于摘要、聊天、数据提取和字幕生成等任务。支持文本、音频、图像和视频输入，拥有1百万的上下文窗口。通过可调整的思考预算，在性能和成本之间取得了平衡，允许开发者控制推理深度。"
  },
  {
    name: "Gemini 2.5 Pro",
    min: 265,
    description: "谷歌最新AI模型，具有高级推理能力，支持文本、图像、音频和视频等多种输入形式。在推理和代码生成方面表现出色，支持100万的上下文窗口，并计划扩展至200万。在多个基准测试中表现出色，适用于学术研究、软件开发和企业应用等多个领域。"
  },
  {
    name: "DeepSeek R1 0528",
    min: 275,
    description: "DeepSeek团队最新开源AI模型，具有显著的性能提升，支持复杂推理和代码生成。基于DeepSeek-V3-0324训练，参数量达6850亿，采用MIT许可证。在LiveCodeBench基准测试中表现出色，超越了多个顶级模型。"
  },
  {
    name: "o4-mini (high)",
    min: 285,
    description: "OpenAI的小型高效模型，针对快速、经济的推理进行了优化。在数学、编程和视觉任务方面表现出色，在AIME 2024和2025基准测试中表现优异。支持多模态输入，与o3相比更加经济实惠，适合日常办公任务和高频率使用的场景。"
  },
  {
    name: "o3",
    min: 290,
    description: "OpenAI最先进的AI模型，旨在提升函数调用和推理能力。在工具调用之间保留内部推理，从而增强决策和性能。经过训练，能够在思考链中自然地使用工具，改善工具使用的时机和方式。"
  },
  {
    name: "SSS-13000B 彩蛋模型",
    min: 300,
    description: "这是一个神秘的彩蛋模型，据说参数高达130000亿，具有超级强大的推理能力和创造力，是人类文明史上最强悍的模型。"
  }
]