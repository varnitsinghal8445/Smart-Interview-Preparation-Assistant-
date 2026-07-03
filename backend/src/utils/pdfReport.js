import PDFDocument from "pdfkit";

export const generateInterviewReportPDF = (interview, user, resume) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).text("Smart Interview Preparation Assistant", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text("Interview Performance Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Candidate: ${user?.name || "N/A"}`);
    doc.text(`Email: ${user?.email || "N/A"}`);
    doc.text(`Date: ${new Date(interview.createdAt).toLocaleDateString()}`);
    doc.text(`Overall Score: ${interview.overallScore}/100`);
    doc.text(`Selection: ${interview.selection}`);
    doc.moveDown();

    if (interview.verdictSummary) {
      doc.fontSize(14).text("Verdict Summary");
      doc.fontSize(11).text(interview.verdictSummary);
      doc.moveDown();
    }

    if (resume?.atsScore) {
      doc.fontSize(14).text("Resume ATS Score");
      doc.fontSize(11).text(`${resume.atsScore}/100`);
      doc.moveDown();
    }

    doc.fontSize(14).text("Question-by-Question Analysis");
    doc.moveDown(0.5);

    (interview.answers || []).forEach((a, i) => {
      doc.fontSize(12).fillColor("#1e40af").text(`Q${i + 1}: ${a.question}`);
      doc.fillColor("#000").fontSize(10).text(`Your Answer: ${a.userAnswer || "N/A"}`);
      doc.text(`Score: ${a.score}/${a.maxScore || 10}`);
      if (a.mistakes?.length) {
        doc.text(`Mistakes: ${a.mistakes.join("; ")}`);
      }
      if (a.suggestedAnswer) {
        doc.text(`Ideal Answer: ${a.suggestedAnswer}`);
      }
      doc.moveDown();
    });

    if (interview.weakTopics?.length) {
      doc.fontSize(14).text("Weak Topics");
      doc.fontSize(11).text(interview.weakTopics.join(", "));
      doc.moveDown();
    }

    if (interview.strongTopics?.length) {
      doc.fontSize(14).text("Strong Topics");
      doc.fontSize(11).text(interview.strongTopics.join(", "));
      doc.moveDown();
    }

    if (interview.roadmap?.weeks?.length) {
      doc.fontSize(14).text("4-Week Learning Roadmap");
      interview.roadmap.weeks.forEach((w) => {
        doc.fontSize(11).text(`Week ${w.week}: ${w.topics.join(", ")} — ${w.focus}`);
      });
      doc.moveDown();
    }

    if (interview.careerRecommendation) {
      const cr = interview.careerRecommendation;
      doc.fontSize(14).text("Career Recommendations");
      doc.fontSize(11).text(`Roles: ${(cr.recommendedRoles || []).join(", ")}`);
      doc.text(`Missing Skills: ${(cr.missingSkills || []).join(", ")}`);
      if (cr.reasoning) doc.text(cr.reasoning);
    }

    doc.end();
  });
};
