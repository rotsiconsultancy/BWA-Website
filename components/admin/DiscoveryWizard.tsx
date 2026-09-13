"use client";

import { useEffect, useState } from "react";

const steps = [
  ["setup", "1", "Set up", "Name and plan this quiz"],
  ["build", "2", "Build", "Questions, answers, and matches"],
  ["review", "3", "Review", "Check and publish"],
] as const;

export default function DiscoveryWizard({
  initialStep = "setup",
}: {
  initialStep?: string;
}) {
  const [activeStep, setActiveStep] = useState(initialStep);

  useEffect(() => {
    document
      .querySelectorAll<HTMLElement>("[data-discovery-step]")
      .forEach((section) => {
        section.hidden = section.dataset.discoveryStep !== activeStep;
      });
  }, [activeStep]);

  return (
    <nav className="admin-discovery-wizard" aria-label="Quiz editing steps">
      {steps.map(([id, number, label, description]) => (
        <button
          key={id}
          className={activeStep === id ? "is-active" : undefined}
          type="button"
          aria-current={activeStep === id ? "step" : undefined}
          onClick={() => setActiveStep(id)}
        >
          <span>{number}</span>
          <strong>{label}</strong>
          <small>{description}</small>
        </button>
      ))}
    </nav>
  );
}
