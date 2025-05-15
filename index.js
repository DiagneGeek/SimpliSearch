const compenize = async (url, pathLayout = {from: ""},displayBtn) => {
  const files = await fetchFiles(url, 'index', pathLayout)
  const root = document.querySelector('#app')
  const output = unit(files[0].content, files).split('  ').join(' ')
  const toDisplay = `${output} \n ${displayBtn ? copyBtn(output) : ''}`
  root.innerHTML = toDisplay
  root.querySelectorAll('script').forEach(s => {
    const text = s.text.trim()
    const type = s.type
    if (s.src) return
    
    const newScript = document.createElement('script')
    newScript.text = text
    newScript.type = type
    s.remove()
    root.appendChild(newScript)
  })
}

const copyBtn = toCopy => (`
  <button id="copy-button"
       style="background: transparent; backdrop-filter:blur(10px); border: 1px solid white; color: #565756; padding: 8px 16px;  position: fixed; bottom: 30px; left: 2%;">
    Copy output
</button>

<script>
  const btn = document.querySelector('#copy-button');
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(\`${toCopy}\`)
  });
  
  setTimeout(() => {
        btn.style.display = 'none';
  }, 3000);
  </script>
  <br>
`)

const fetchFiles = async (url, name, pathLayout) => {
  let files = []
  const filename = url.slice(url.lastIndexOf('/') + 1)
  if (!filename.endsWith('.comp')) return []
  const res = await fetch(url)
  if (!res.ok) {
    console.error('failed to fetch ' + url)
    return [] // Retourner un tableau vide en cas d'échec de fetch
  }
  let content = await res.text()
  content = content.split('  ').join(' ')
  let index = files.length
  files.push({ content, filename, url, name })
  
  const imports = content.match(/<import\s+name="([^"]+)"\s+from="([^"]+)"\s*\/>/g)
  
  if (imports) {
    // Obtenir le chemin du répertoire de l'URL actuelle
    
    for (let i of imports) {
      content = content.replace(i, '')
      // Extraction du nom et du chemin comme précédemment
      i = i.slice(i.indexOf(' '), -2).trim()
      let [importName, importPath] = i.split(' ')
        .map(x => {
          return x.slice(x.indexOf('"') + 1, x.lastIndexOf('"')).trim()
        })
      let absolutePath = importPath
      if (pathLayout.from.trim()) {
      absolutePath = absolutePath.replace(`@${pathLayout.from}`, pathLayout.to)
    }
      
      files = files.concat(...(await fetchFiles(absolutePath, importName, pathLayout)));
    }
    files[index].content = content.trim()
  }
  return files
}


const unit = (html, files) => {
  // Fonction pour parser les props d'une chaîne
  const parseProps = (str) => {
    const props = {};
    const findProps = /(\w+)\s*=\s*("[^"]*"|'[^']*'|[^\s]+)/g;
    let match;
    while ((match = findProps.exec(str))) {
      let [, key, val] = match;
      if ((val.startsWith(`"`) && val.endsWith(`"`)) || (val.startsWith(`'`) && val.endsWith(`'`))) {
        val = val.slice(1, -1);
      }
      props[key] = val;
    }
    return props;
  };
  
  // Fonction récursive pour remplacer un composant par son contenu
  const renderComponent = (name, props, children = '') => {
    let content = files.find(f => f.name === name)?.content;
    if (!content) throw new ReferenceError(`The content of ${name} is not found`);
    content = unit(content, files); // récursivité pour composants imbriqués
    props.children = children.trim(); // ajoute la prop spéciale $children
    for (const key in props) {
      content = content.replaceAll(`$${key}`, props[key]);
    }
    return content;
  };
  
  // Boucle tant qu'on trouve des composants imbriqués
  let hasMatch = true;
  while (hasMatch) {
    hasMatch = false;
    
    // Composants avec contenu
    html = html.replace(
      /<([A-Z][a-zA-Z0-9_]*)\s*((?:\s*\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))*)>(.*?)<\/\1>/gs,
      (_, name, rawProps, children) => {
        hasMatch = true;
        const props = parseProps(rawProps);
        return renderComponent(name, props, children);
      }
    );
    
    // Composants auto-fermants
    html = html.replace(
      /<([A-Z][a-zA-Z0-9_]*)\s*((?:\s*\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s*>]+))*)\s*\/>/g,
      (_, name, rawProps) => {
        hasMatch = true;
        const props = parseProps(rawProps);
        return renderComponent(name, props);
      }
    );
  }
  
  return html;
};

export const render = (path, pathLayout, dB = false) => compenize(path, pathLayout, dB)