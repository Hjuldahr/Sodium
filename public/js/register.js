document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector("form");

    const username = document.getElementById("user");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const passwordConfirm = document.getElementById("password_confirm");

    const passwordStrengthMeter = document.getElementById("password_strength_meter");
    const passwordStrengthText = document.getElementById("password_strength_text")
    let password_score = 0;

    password.addEventListener('input', function(event) {
        if (!password.value) {
            password_score = 0;
            passwordStrengthMeter.value = 0;
            passwordStrengthText.textContent = "";
            return;
        } else if (password.value.length < 12) {
            passwordStrengthMeter.value = 0;
            passwordStrengthText.textContent = "Too short";
            return;
        }
        const result = zxcvbn(password.value);
        password_score = result.score;
        passwordStrengthMeter.value = password_score;

        const label = ["Unsecure", "Insufficient", "Nearly There", "Sufficient", "Secure"];
        passwordStrengthText.textContent = label[password_score];
    });

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        [username, email, password, passwordConfirm].forEach(input =>
            input.classList.remove('invalid_input')
        );

        let valid = true;
        let warnings = new Set();

        // Required fields
        if (!username.value || !email.value || !password.value || !passwordConfirm.value) {
            valid = false;
            [username, email, password, passwordConfirm].forEach(input => {
                if (!input.value) input.classList.add('invalid_input');
            });
            warnings.add("All fields are required.");
        }

        // Password match
        if (password.value !== passwordConfirm.value) {
            valid = false;
            password.classList.add('invalid_input');
            passwordConfirm.classList.add('invalid_input');
            warnings.add("Passwords do not match.");
        }

        // Password strength (authoritative check)
        const strengthResult =
            password.value.length >= 12 ? zxcvbn(password.value) : { score: 0 };

        if (strengthResult.score < 3) {
            valid = false;
            password.classList.add('invalid_input');
            warnings.add("Password is not safe enough.");
        }

        if (!valid) {
            alert([...warnings].join("\n"));
            return;
        }

        const payload = {
            username: username.value,
            email: email.value,
            password: password.value
        };

        try {
            const response = await fetch("/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Signup successful!");
                form.reset();
                passwordStrengthMeter.value = 0;
                passwordStrengthText.textContent = "";
            } else {
                alert("Server error: " + await response.text());
            }
        } catch (err) {
            alert("Network error: " + err.message);
        }
    });
});
