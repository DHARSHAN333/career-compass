"""
Knowledge base loader for RAG system
Loads sample resumes, job templates, and best practices
"""
import os
import json
from typing import List, Dict
from pathlib import Path

class KnowledgeBase:
    def __init__(self, base_path: str = None):
        if base_path is None:
            # Default to data/knowledge_base relative to this file
            current_dir = Path(__file__).parent.parent.parent
            self.base_path = current_dir / "data" / "knowledge_base"
        else:
            self.base_path = Path(base_path)
        
        self.resumes_path = self.base_path / "sample_resumes"
        self.jobs_path = self.base_path / "job_templates"
        self.tips_path = self.base_path / "best_practices"
    
    def load_sample_resumes(self) -> List[Dict[str, str]]:
        """Load all sample resumes from knowledge base"""
        resumes = []
        
        if not self.resumes_path.exists():
            print(f"Warning: Resume path not found: {self.resumes_path}")
            return resumes
        
        for file_path in self.resumes_path.glob("*.txt"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Extract metadata from filename
                filename = file_path.stem
                parts = filename.rsplit('_', 1)
                role = parts[0].replace('_', ' ').title()
                score = parts[1] if len(parts) > 1 else "85"
                
                resumes.append({
                    "content": content,
                    "role": role,
                    "score": score,
                    "filename": filename,
                    "type": "sample_resume"
                })
            except Exception as e:
                print(f"Error loading resume {file_path}: {e}")
        
        print(f"✓ Loaded {len(resumes)} sample resumes")
        return resumes
    
    def load_job_templates(self) -> List[Dict[str, str]]:
        """Load job description templates"""
        jobs = []
        
        if not self.jobs_path.exists():
            print(f"Warning: Jobs path not found: {self.jobs_path}")
            return jobs
        
        for file_path in self.jobs_path.glob("*.txt"):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                role = file_path.stem.replace('_', ' ').title()
                
                jobs.append({
                    "content": content,
                    "role": role,
                    "filename": file_path.stem,
                    "type": "job_template"
                })
            except Exception as e:
                print(f"Error loading job template {file_path}: {e}")
        
        print(f"✓ Loaded {len(jobs)} job templates")
        return jobs
    
    def load_best_practices(self) -> Dict:
        """Load best practices and tips"""
        tips_file = self.tips_path / "resume_tips.json"
        
        if not tips_file.exists():
            print(f"Warning: Tips file not found: {tips_file}")
            return {}
        
        try:
            with open(tips_file, 'r', encoding='utf-8') as f:
                tips = json.load(f)
            print(f"✓ Loaded best practices")
            return tips
        except Exception as e:
            print(f"Error loading best practices: {e}")
            return {}
    
    def get_all_documents(self) -> List[Dict[str, str]]:
        """Get all documents from knowledge base"""
        all_docs = []
        
        # Load resumes
        all_docs.extend(self.load_sample_resumes())
        
        # Load job templates
        all_docs.extend(self.load_job_templates())
        
        # Load best practices as documents
        tips = self.load_best_practices()
        if tips:
            # Convert tips to document format
            for category, items in tips.items():
                if isinstance(items, list):
                    content = f"{category.upper()}:\n" + "\n".join([f"• {item}" for item in items])
                elif isinstance(items, dict):
                    content = f"{category.upper()}:\n"
                    for sub_cat, sub_items in items.items():
                        content += f"\n{sub_cat}:\n" + "\n".join([f"• {item}" for item in sub_items])
                else:
                    continue
                
                all_docs.append({
                    "content": content,
                    "role": category,
                    "type": "best_practice",
                    "filename": f"tips_{category}"
                })
        
        print(f"✓ Total documents in knowledge base: {len(all_docs)}")
        return all_docs
    
    def get_tips_for_role(self, role: str) -> List[str]:
        """Get role-specific tips"""
        tips = self.load_best_practices()
        role_lower = role.lower().replace(' ', '_')
        
        role_specific = tips.get('role_specific', {})
        return role_specific.get(role_lower, tips.get('general_tips', []))

# Global instance
_knowledge_base = None

def get_knowledge_base() -> KnowledgeBase:
    """Get or create global knowledge base instance"""
    global _knowledge_base
    if _knowledge_base is None:
        _knowledge_base = KnowledgeBase()
    return _knowledge_base
