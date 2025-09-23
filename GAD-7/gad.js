// === Theme Toggle ===
        const themeSwitcher = document.getElementById("themeSwitcher");
        themeSwitcher.addEventListener("change", () => {
            document.body.classList.toggle("dark", themeSwitcher.checked);
            document.body.classList.toggle("light", !themeSwitcher.checked);
        });

        // === GAD-7 Logic ===
        const GAD7_QUESTIONS = [
            "Feeling nervous, anxious, or on edge",
            "Not being able to stop or control worrying",
            "Worrying too much about different things",
            "Trouble relaxing",
            "Being so restless that it's hard to sit still",
            "Becoming easily annoyed or irritable",
            "Feeling afraid as if something awful might happen"
        ];

        function interpretGAD7Score(score) {
            if (score >= 0 && score <= 4) return "Minimal anxiety";
            if (score >= 5 && score <= 9) return "Mild anxiety";
            if (score >= 10 && score <= 14) return "Moderate anxiety";
            if (score >= 15 && score <= 21) return "Severe anxiety";
            return "Invalid score";
        }

        const questionsDiv = document.getElementById("questions");
        GAD7_QUESTIONS.forEach((questionText, i) => {
            const questionDiv = document.createElement("div");
            questionDiv.classList.add("question");
            questionDiv.innerHTML = `
                <p>${i+1}. ${questionText}</p>
                <select name="q${i}" required>
                    <option value="">Select...</option>
                    <option value="0">0 - Not at all</option>
                    <option value="1">1 - Several days</option>
                    <option value="2">2 - More than half the days</option>
                    <option value="3">3 - Nearly every day</option>
                </select>
            `;
            questionsDiv.appendChild(questionDiv);
        });

        document.getElementById("gad7-form").addEventListener("submit", function (e) {
            e.preventDefault();

            const selects = document.querySelectorAll("#gad7-form select");
            let score = 0;
            selects.forEach(select => {
                score += parseInt(select.value);
            });

            const interpretation = interpretGAD7Score(score);

            const resultDiv = document.getElementById("result");
            resultDiv.style.display = "block";
            resultDiv.innerHTML = `
                <strong>Score:</strong> ${score} <br/>
                <strong>Interpretation:</strong> ${interpretation}
            `;
        });