export function getIconForSkill(skill) {
  const s = skill.toLowerCase();
  if (s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('next') || s.includes('front')) {
    return 'fa-brands fa-react';
  } else if (s.includes('node') || s.includes('js') || s.includes('javascript') || s.includes('ts') || s.includes('typescript')) {
    return 'fa-brands fa-js';
  } else if (s.includes('aws') || s.includes('cloud') || s.includes('azure') || s.includes('gcp')) {
    return 'fa-solid fa-cloud';
  } else if (s.includes('docker') || s.includes('kube') || s.includes('infra') || s.includes('kubernetes')) {
    return 'fa-brands fa-docker';
  } else if (s.includes('devops') || s.includes('ci/cd') || s.includes('pipeline') || s.includes('github actions')) {
    return 'fa-solid fa-infinity';
  } else if (s.includes('linux')) {
    return 'fa-brands fa-linux';
  } else if (s.includes('terraform')) {
    return 'fa-solid fa-server';
  } else if (s.includes('python') || s.includes('django') || s.includes('flask')) {
    return 'fa-brands fa-python';
  } else if (s.includes('figma') || s.includes('ui') || s.includes('ux') || s.includes('design') || s.includes('illustrator')) {
    return 'fa-solid fa-palette';
  } else if (s.includes('git') || s.includes('github') || s.includes('gitlab')) {
    return 'fa-brands fa-git-alt';
  } else if (s.includes('db') || s.includes('sql') || s.includes('mongo') || s.includes('postgres') || s.includes('graphql')) {
    return 'fa-solid fa-database';
  }
  return 'fa-solid fa-code';
}

export function getProfessionImages(profession) {
  const p = (profession || '').toLowerCase();
  
  // DevOps, SysAdmin, Ops, SRE
  if (p.includes('devops') || p.includes('ops') || p.includes('system admin') || p.includes('sre') || p.includes('infrastructure') || p.includes('sysadmin')) {
    return {
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      workspace: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
      project1: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80",
      project2: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      project3: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80"
    };
  }

  // Software developer, coder, engineer, tech
  if (p.includes('developer') || p.includes('engineer') || p.includes('coder') || p.includes('programmer') || p.includes('tech') || p.includes('software') || p.includes('dev') || p.includes('web')) {
    return {
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      workspace: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
      project1: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
      project2: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      project3: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
    };
  }
  
  // UI/UX designer, artist, creative, illustrator
  if (p.includes('designer') || p.includes('illustrator') || p.includes('creative') || p.includes('art') || p.includes('ux') || p.includes('ui') || p.includes('product')) {
    return {
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      workspace: "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=600&q=80",
      project1: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=600&q=80",
      project2: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      project3: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&q=80"
    };
  }

  // Architect, building designer
  if (p.includes('architect') || p.includes('building') || p.includes('interior') || p.includes('structures') || p.includes('construction')) {
    return {
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      workspace: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
      project1: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
      project2: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
      project3: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=600&q=80"
    };
  }

  // Default fallback images
  return {
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    workspace: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
    project1: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    project2: "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=600&q=80",
    project3: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
  };
}
