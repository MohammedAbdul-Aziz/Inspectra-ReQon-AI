def calculate_hygiene_score(defects: list) -> float:
    """
    Calculates a Hygiene Score (0-100) using a weighted penalty system.
    Critical failures have a non-linear impact on the final score.
    """
    if not defects:
        return 100.0

    # Weights based on Severity (1-5)
    # Severity 5 (Critical) causes a massive drop
    penalties = {
        5: 25,  # e.g., Security flaw or crash
        4: 15,  # e.g., Broken primary function
        3: 7,   # e.g., Console errors/Accessibility
        2: 3,   # e.g., Minor UI misalignment
        1: 1    # e.g., Suggestion
    }

    total_penalty = sum(penalties.get(d.get('severity', 1), 1) for d in defects)
    
    # Ensure the score doesn't go below 0
    final_score = max(0.0, 100.0 - total_penalty)
    return float(round(final_score, 2))