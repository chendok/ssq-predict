from pathlib import Path

import yaml
from cryptography.fernet import Fernet


class SecureConfigLoader:
    def __init__(self, config_path=None, key_path=None):
        base_dir = Path(__file__).parent
        if config_path:
            self.config_path = Path(config_path)
        else:
            self.config_path = base_dir / "ai_config.yaml"

        if key_path:
            self.key_path = Path(key_path)
        else:
            self.key_path = base_dir / ".secret.key"

        self.key = self._load_or_generate_key()
        self.cipher_suite = Fernet(self.key)

    def _load_or_generate_key(self):
        if self.key_path.exists():
            return self.key_path.read_bytes()
        else:
            key = Fernet.generate_key()
            self.key_path.parent.mkdir(parents=True, exist_ok=True)
            self.key_path.write_bytes(key)
            return key

    def encrypt_value(self, value):
        if not value:
            return ""
        return self.cipher_suite.encrypt(value.encode()).decode()

    def decrypt_value(self, encrypted_value):
        if not encrypted_value:
            return ""
        try:
            return self.cipher_suite.decrypt(encrypted_value.encode()).decode()
        except Exception:
            # Fallback for plain text (during dev/migration)
            return encrypted_value

    def load_config(self):
        if not self.config_path.exists():
            # Create default config if not exists
            default_config = {
                "api_key": self.encrypt_value("sk-9f3284da3a3a488c86823eaf1fd1b86f"),
                "model_version": "deepseek-chat",
                "max_tokens": 2048,
                "temperature": 0.7,
                "base_url": "https://api.deepseek.com/v1",
            }
            self.config_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.config_path, "w") as f:
                yaml.dump(default_config, f)
            return {k: self.decrypt_value(v) if k == "api_key" else v for k, v in default_config.items()}

        with open(self.config_path, "r") as f:
            config = yaml.safe_load(f)

        # Decrypt sensitive fields
        if "api_key" in config:
            config["api_key"] = self.decrypt_value(config["api_key"])

        return config


# Global instance
secure_config = SecureConfigLoader()
