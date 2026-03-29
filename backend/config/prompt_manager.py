from pathlib import Path

import yaml


class PromptManager:
    def __init__(self, prompts_path=None):
        if prompts_path is None:
            # Default to prompts.yaml in the same directory as this file
            self.prompts_path = Path(__file__).parent / "prompts.yaml"
        else:
            self.prompts_path = Path(prompts_path)
        self.prompts = self._load_prompts()

    def _load_prompts(self):
        if not self.prompts_path.exists():
            return {}
        with open(self.prompts_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    def get_prompt(self, key, **kwargs):
        """
        Get a prompt template and format it with kwargs.
        """
        template_config = self.prompts.get(key)
        if not template_config:
            raise ValueError(f"Prompt key '{key}' not found.")

        template = template_config.get("template", "")
        try:
            return template.replace("{{ ", "{").replace(" }}", "}").format(**kwargs)
        except KeyError as e:
            raise ValueError(f"Missing parameter for prompt '{key}': {e}")

    def reload_prompts(self):
        self.prompts = self._load_prompts()


prompt_manager = PromptManager()
