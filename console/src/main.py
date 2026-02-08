# [Spec]: specs/features/task-crud.md
# TodoEvolve Console App - Main CLI

"""
Command-line interface for TodoEvolve.
Implements interactive menu as per Phase I requirements.
"""

import sys
from typing import Optional
from .task_manager import TaskManager, TaskNotFoundError


class TodoEvolveCLI:
    """
    Interactive command-line interface for TodoEvolve.
    
    Provides a menu-driven interface for task management.
    """
    
    MENU = """
╔══════════════════════════════════════════════════════════════╗
║     🚀 TodoEvolve - Smart Multilingual Productivity          ║
╠══════════════════════════════════════════════════════════════╣
║  1. ➕ Add Task                                               ║
║  2. 📋 View Tasks                                             ║
║  3. 🗑️  Delete Task                                            ║
║  4. ✏️  Update Task                                            ║
║  5. ✅ Toggle Complete                                        ║
║  6. 🚪 Exit                                                   ║
╚══════════════════════════════════════════════════════════════╝
"""
    
    def __init__(self) -> None:
        """Initialize the CLI with a TaskManager."""
        self.manager = TaskManager()
        self.running = True
    
    def clear_line(self) -> None:
        """Print a visual separator."""
        print("-" * 50)
    
    def display_menu(self) -> None:
        """Show the main menu."""
        print(self.MENU)
        stats = f"📊 Total: {self.manager.count()} | ✅ Done: {self.manager.count_completed()} | ⏳ Pending: {self.manager.count_pending()}"
        print(stats)
        self.clear_line()
    
    def get_input(self, prompt: str) -> str:
        """Get user input with prompt."""
        try:
            return input(prompt).strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\n👋 Goodbye!")
            sys.exit(0)
    
    def get_task_id(self) -> Optional[int]:
        """Get and validate a task ID from user."""
        id_str = self.get_input("Enter task ID: ")
        try:
            return int(id_str)
        except ValueError:
            print("\n❌ Error: Please enter a valid task ID (number)")
            return None
    
    def add_task(self) -> None:
        """Handle adding a new task."""
        print("\n➕ ADD NEW TASK")
        self.clear_line()
        
        title = self.get_input("Title (required): ")
        if not title:
            print("\n❌ Error: Title is required")
            return
        
        description = self.get_input("Description (optional, press Enter to skip): ")
        
        try:
            task = self.manager.add_task(title, description)
            print(f"\n✅ Task created successfully!")
            print(f"   ID: {task.id}")
            print(f"   Title: {task.title}")
            if task.description:
                print(f"   Description: {task.description}")
        except ValueError as e:
            print(f"\n❌ {e}")
    
    def view_tasks(self) -> None:
        """Handle viewing all tasks."""
        print("\n📋 YOUR TASKS")
        self.clear_line()
        
        tasks = self.manager.list_tasks()
        
        if not tasks:
            print("📭 No tasks yet. Add your first task!")
            return
        
        for task in tasks:
            status_icon = "✅" if task.completed else "⏳"
            status_text = "[DONE]" if task.completed else "[TODO]"
            print(f"  {task.id}. {status_icon} {status_text} {task.title}")
            if task.description:
                print(f"      └─ {task.description[:50]}{'...' if len(task.description) > 50 else ''}")
        
        self.clear_line()
        print(f"Total: {len(tasks)} task(s)")
    
    def delete_task(self) -> None:
        """Handle deleting a task."""
        print("\n🗑️  DELETE TASK")
        self.clear_line()
        
        task_id = self.get_task_id()
        if task_id is None:
            return
        
        try:
            task = self.manager.delete_task(task_id)
            print(f"\n✅ Task deleted: '{task.title}'")
        except TaskNotFoundError as e:
            print(f"\n❌ {e}")
    
    def update_task(self) -> None:
        """Handle updating a task."""
        print("\n✏️  UPDATE TASK")
        self.clear_line()
        
        task_id = self.get_task_id()
        if task_id is None:
            return
        
        try:
            current_task = self.manager.get_task(task_id)
            print(f"Current title: {current_task.title}")
            print(f"Current description: {current_task.description or '(none)'}")
            self.clear_line()
            
            new_title = self.get_input("New title (press Enter to keep current): ")
            new_desc = self.get_input("New description (press Enter to keep current): ")
            
            task = self.manager.update_task(
                task_id,
                title=new_title if new_title else None,
                description=new_desc if new_desc else None
            )
            print(f"\n✅ Task updated successfully!")
            print(f"   Title: {task.title}")
            print(f"   Description: {task.description or '(none)'}")
        except TaskNotFoundError as e:
            print(f"\n❌ {e}")
        except ValueError as e:
            print(f"\n❌ {e}")
    
    def toggle_complete(self) -> None:
        """Handle toggling task completion."""
        print("\n✅ TOGGLE COMPLETE")
        self.clear_line()
        
        task_id = self.get_task_id()
        if task_id is None:
            return
        
        try:
            task = self.manager.toggle_complete(task_id)
            status = "completed ✅" if task.completed else "pending ⏳"
            print(f"\n✅ Task '{task.title}' marked as {status}")
        except TaskNotFoundError as e:
            print(f"\n❌ {e}")
    
    def exit_app(self) -> None:
        """Handle exiting the application."""
        print("\n👋 Thank you for using TodoEvolve! Goodbye!")
        self.running = False
    
    def run(self) -> None:
        """Main application loop."""
        print("\n" + "=" * 50)
        print("   Welcome to TodoEvolve!")
        print("   Smart Multilingual Productivity Assistant")
        print("=" * 50)
        
        actions = {
            "1": self.add_task,
            "2": self.view_tasks,
            "3": self.delete_task,
            "4": self.update_task,
            "5": self.toggle_complete,
            "6": self.exit_app,
        }
        
        while self.running:
            self.display_menu()
            choice = self.get_input("Enter choice (1-6): ")
            
            if choice in actions:
                actions[choice]()
                if self.running:
                    print()
                    self.get_input("Press Enter to continue...")
            else:
                print("\n❌ Error: Please enter a valid option (1-6)")


def main() -> None:
    """Entry point for the application."""
    cli = TodoEvolveCLI()
    cli.run()


if __name__ == "__main__":
    main()
