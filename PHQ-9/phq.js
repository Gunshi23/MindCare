// === Theme Toggle ===
        const themeSwitcher = document.getElementById("themeSwitcher");
        themeSwitcher.addEventListener("change", () => {
            document.body.classList.toggle("dark", themeSwitcher.checked);
            document.body.classList.toggle("light", !themeSwitcher.checked);
        });

        // === PHQ-9 Logic ===
        const phq9Questions = [
            "Little interest or pleasure in doing things?",
            "Feeling down, depressed, or hopeless?",
            "Trouble falling or staying asleep, or sleeping too much?",
            "Feeling tired or having little energy?",
            "Poor appetite or overeating?",
            "Feeling bad about yourself — or that you are a failure?",
            "Trouble concentrating on things, such as reading or watching TV?",
            "Moving or speaking slowly / restlessness?",
            "Thoughts that you would be better off dead, or of hurting yourself?"
        ];
        const options = [
            "0 - Not at all",
            "1 - Several days",
            "2 - More than half the days",
            "3 - Nearly every day"
        ];

        const questionsDiv = document.getElementById("questions");
        phq9Questions.forEach((q, i) => {
            const div = document.createElement("div");
            div.classList.add("phq9-question");
            div.innerHTML = `<p>${i+1}. ${q}</p>`;
            const optDiv = document.createElement("div");
            optDiv.classList.add("phq9-options");
            options.forEach((opt, j) => {
                optDiv.innerHTML += `<label><input type="radio" name="q${i}" value="${j}" required> ${opt}</label>`;
            });
            div.appendChild(optDiv);
            questionsDiv.appendChild(div);
        });

        function getScoreInterpretation(score) {
            if (score >= 0 && score <= 4) return "Minimal depression";
            if (score >= 5 && score <= 9) return "Mild depression";
            if (score >= 10 && score <= 14) return "Moderate depression";
            if (score >= 15 && score <= 19) return "Moderately severe depression";
            if (score >= 20 && score <= 27) return "Severe depression";
            return "Invalid score";
        }

        document.getElementById("phq9Form").addEventListener("submit", e => {
            e.preventDefault();
            let score = 0;
            const form = e.target;
            for (let i = 0; i < 9; i++) {
                const selectedOption = form.querySelector(`input[name="q${i}"]:checked`);
                if (selectedOption) {
                    score += parseInt(selectedOption.value);
                }
            }
            
            const interpretation = getScoreInterpretation(score);
            const resultDiv = document.getElementById("result");
            resultDiv.style.display = "block";
            resultDiv.innerHTML = `
                <strong>Score:</strong> ${score} <br/>
                <strong>Interpretation:</strong> ${interpretation}
            `;
        });