# @ Divyanshu 
# python generate-ua.py 

import json
import random
from datetime import date

try:
    from fake_useragent import UserAgent
except ImportError:
    import os
    os.system("pip install fake-useragent")
    from fake_useragent import UserAgent

def generate_useragents(browser_choice, count=1000):
    ua = UserAgent()

    # Predefined distributions for "mix"
    weights = {'chrome': 0.7, 'firefox': 0.2, 'edge': 0.1}

    agents = []
    for _ in range(count):
        if browser_choice == "all":
            agents.append(ua.random)
        elif browser_choice == "chrome":
            agents.append(ua.chrome)
        elif browser_choice == "firefox":
            agents.append(ua.firefox)
        elif browser_choice == "edge":
            agents.append(ua.edge)
        elif browser_choice == "mix":
            browser = random.choices(list(weights.keys()), weights=list(weights.values()))[0]
            agents.append(getattr(ua, browser))
        else:
            print(" Invalid choice. Defaulting to Chrome.")
            agents.append(ua.chrome)

    return agents


def main():
    print("\nUser-Agent Generator\n")
    print("Choose browser type to generate User-Agents:\n")
    print("1. All (Chrome + Firefox + Safari + Edge + etc.)")
    print("2. Chrome only")
    print("3. Firefox only")
    print("4. Edge only")
    print("5. Mix (Realistic ratio: 70% Chrome, 20% Firefox, 10% Edge)")
    print("6. Custom count (default 1000)\n")

    choice = input("Enter your choice [1-5]: ").strip()

    mapping = {
        "1": "all",
        "2": "chrome",
        "3": "firefox",
        "4": "edge",
        "5": "mix"
    }

    browser_choice = mapping.get(choice, "chrome")

    try:
        count = int(input("Enter number of User-Agents to generate (default 1000): ").strip() or "1000")
    except ValueError:
        count = 1000

    print(f"\nGenerating {count} {browser_choice.capitalize()} User-Agents...\n")

    agents = generate_useragents(browser_choice, count)

    data = {
        "updated": str(date.today()),
        "count": len(agents),
        "browser_choice": browser_choice,
        "useragents": agents
    }

    with open("latest-useragents.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print(f"Successfully created latest-useragents.json with {len(agents)} entries.")
    print("File saved in the current directory.\n")

if __name__ == "__main__":
    main()
