import React, { useState } from "react";
import { Mail, MapPin, Clock, Send, Copy, Check } from "lucide-react";
import Komentar from "../components/Commentar";
import Swal from "sweetalert2";
import axios from "axios";
import { usePortfolio } from "../context/PortfolioContext";

const ContactPage = () => {
  const { config, accent, containerClass, cardRadiusClass, buttonRadiusClass } = usePortfolio();
  const contact = config?.contact || {};
  const profile = config?.profile || {};
  const sections = config?.sections || {};
  const elements = config?.elements || {};

  // If both contact and guestbook are disabled, return null
  if (sections.contact === false && sections.guestbook === false) {
    return null;
  }

  const myEmail = profile.contactEmail || "nizamsetiawan15@gmail.com";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(myEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      Swal.fire({
        title: "Formulir Belum Lengkap",
        text: "Harap isi semua kolom sebelum mengirimkan pesan.",
        icon: "warning",
        confirmButtonColor: accent.hex || "#10b981",
      });
      return;
    }

    setIsSubmitting(true);

    Swal.fire({
      title: "Mengirim Pesan...",
      text: "Harap tunggu selagi pesan Anda dikirimkan.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const formSubmitUrl = `https://formsubmit.co/${myEmail}`;
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("message", formData.message);
      submitData.append("_subject", `Pesan Portofolio dari: ${formData.name}`);
      submitData.append("_captcha", "false");
      submitData.append("_template", "table");

      await axios.post(formSubmitUrl, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        title: "Pesan Berhasil Terkirim!",
        text: "Terima kasih telah menghubungi saya. Saya akan segera merespons pesan Anda.",
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 2500,
        showConfirmButton: false,
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      Swal.fire({
        title: "Gagal Mengirim Pesan",
        text: "Terjadi gangguan saat mengirimkan formulir. Anda dapat mengirim email langsung ke " + myEmail,
        icon: "error",
        confirmButtonColor: "#10b981",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="Contact" className={`py-20 px-4 sm:px-6 lg:px-8 ${containerClass} mx-auto space-y-20 border-t border-zinc-200 dark:border-zinc-800/80`}>
      {/* SECTION 1: CONTACT FORM & INFO (Toggleable) */}
      {sections.contact !== false && (
        <div>
          <div className="space-y-2 mb-10">
            <div className={`text-xs font-semibold uppercase tracking-wider ${accent.text}`}>
              {contact.tag || "Mulai Terhubung"}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {contact.title || "Mari Berdiskusi & Berkolaborasi"}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
              {contact.description || "Apakah Anda memiliki tawaran proyek, peluang kerja penuh waktu, atau sekadar ingin bertukar pikiran mengenai teknologi, kotak masuk saya selalu terbuka."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Direct Email & Location Meta Box (Toggleable) */}
            {elements.contactDirectEmail !== false && (
              <div className="lg:col-span-5 space-y-4">
                <div className={`p-6 ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-5`}>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      Surel Langsung
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Klik untuk menyalin alamat email atau kirim pesan instan.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs sm:text-sm font-mono text-zinc-800 dark:text-zinc-200 truncate pr-2">
                      {myEmail}
                    </span>
                    <button
                      onClick={handleCopyEmail}
                      className={`p-2 rounded-lg bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors shrink-0 shadow-sm`}
                      title="Salin Alamat Email"
                    >
                      {copied ? <Check className={`w-4 h-4 ${accent.text}`} /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>{contact.responseTime || "Waktu respon: Kurang dari 24 jam"}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>{contact.locationNote || "Indonesia (WIB / UTC+7) • Siap Bekerja Remote"}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Message Form (Toggleable) */}
            {elements.contactForm !== false && (
              <div className={`${elements.contactDirectEmail !== false ? "lg:col-span-7" : "lg:col-span-12"}`}>
                <form
                  onSubmit={handleSubmit}
                  className={`p-6 sm:p-8 ${cardRadiusClass} bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 shadow-sm space-y-4`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="cth. Sarah Jenkins"
                        required
                        className={`w-full px-4 py-2.5 text-sm ${cardRadiusClass} bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Alamat Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="cth. sarah@company.com"
                        required
                        className={`w-full px-4 py-2.5 text-sm ${cardRadiusClass} bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Pesan Anda
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Jelaskan kebutuhan proyek, tawaran posisi, atau pertanyaan Anda..."
                      required
                      className={`w-full px-4 py-2.5 text-sm ${cardRadiusClass} bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors resize-none`}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto ${buttonRadiusClass} bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm active:scale-95 disabled:opacity-50`}
                  >
                    <span>{isSubmitting ? "Mengirimkan Pesan..." : "Kirim Pesan"}</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: REAL-TIME GUESTBOOK / KOMENTAR (Toggleable) */}
      {sections.guestbook !== false && (
        <div className="pt-6">
          <Komentar />
        </div>
      )}
    </div>
  );
};

export default ContactPage;
