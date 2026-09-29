import Image from "next/image";

const technologies = [
  { nom: "Microsoft Azure", logo: "microsoftazure" },
  { nom: "AWS", logo: "amazonwebservices" },
  { nom: "Google Cloud", logo: "googlecloud" },
  { nom: "VMware", logo: "vmware" },
  { nom: "Docker", logo: "docker" },
  { nom: "Kubernetes", logo: "kubernetes" },
  { nom: "Terraform", logo: "terraform" },
  { nom: "Ansible", logo: "ansible" },
  { nom: "Cisco", logo: "cisco" },
  { nom: "Fortinet", logo: "fortinet" },
  { nom: "Ubiquiti", logo: "ubiquiti" },
  { nom: "WireGuard", logo: "wireguard" },
  { nom: "Microsoft 365", logo: "microsoft" },
  { nom: "Odoo", logo: "odoo" },
  { nom: "Next.js", logo: "nextdotjs" },
  { nom: "PostgreSQL", logo: "postgresql" },
  { nom: "Grafana", logo: "grafana" },
  { nom: "Prometheus", logo: "prometheus" },
];

function GroupeTechnologies({ copie = false }) {
  return (
    <div className="bandeauTechnologies__groupe" aria-hidden={copie ? "true" : undefined}>
      {technologies.map((technologie) => (
        <div className="bandeauTechnologies__element" key={technologie.nom}>
          <Image
            src={`/logos/technologies/${technologie.logo}.svg`}
            width={30}
            height={30}
            alt=""
          />
          <span>{technologie.nom}</span>
        </div>
      ))}
    </div>
  );
}

export default function BandeauTechnologies() {
  return (
    <section className="bandeauTechnologies" id="technologies" aria-labelledby="technologies-mobilisables">
      <div className="conteneur bandeauTechnologies__entete">
        <span id="technologies-mobilisables">Technologies mobilisables</span>
        <small>Cloud · DevOps · Réseaux · Cybersécurité · Digitalisation</small>
      </div>
      <div className="bandeauTechnologies__fenetre">
        <div className="bandeauTechnologies__piste">
          <GroupeTechnologies />
          <GroupeTechnologies copie />
        </div>
      </div>
    </section>
  );
}
