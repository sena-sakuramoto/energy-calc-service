import os
import yaml
from pathlib import Path
from typing import Any, Dict


def get_project_root() -> Path:
    """Get the project root directory."""
    return Path(__file__).parent.parent.parent


def load_yaml(path: str) -> Dict[str, Any]:
    """
    Load YAML file with path resolution relative to project root.
    
    Args:
        path: Relative path from project root or absolute path
        
    Returns:
        Parsed YAML data
        
    Raises:
        FileNotFoundError: If file doesn't exist
        yaml.YAMLError: If file is not valid YAML
    """
    if os.path.isabs(path):
        file_path = Path(path)
    else:
        file_path = get_project_root() / path
    
    if not file_path.exists():
        raise FileNotFoundError(f"YAML file not found: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as file:
        try:
            return yaml.safe_load(file) or {}
        except yaml.YAMLError as e:
            raise yaml.YAMLError(f"Error parsing YAML file {file_path}: {e}")