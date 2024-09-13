import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let panel: vscode.WebviewPanel | undefined = undefined;
    let activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

    // Cria um comando que abre o WebviewPanel
    const openAndReplicate = vscode.commands.registerCommand('extension.tagscheck', () => {
        if (activeEditor) {
            if (panel) {
                // Se o WebviewPanel já estiver aberto, apenas foca nele
                panel.reveal(vscode.ViewColumn.Beside);
            } else {
                // Cria um novo WebviewPanel
                panel = vscode.window.createWebviewPanel(
                    'replicatedCode',
                    'Replicado',
                    vscode.ViewColumn.Beside,
                    { enableScripts: true }
                );


                // Define o conteúdo inicial do Webview
                panel.webview.html = getWebviewContent(filterLines(activeEditor.document.getText()));

                // Atualiza o conteúdo do Webview quando o documento muda
                const onDidChangeTextDocument = vscode.workspace.onDidChangeTextDocument((event) => {
                    if (event.document === activeEditor?.document) {
                        const updatedText = filterLines(event.document.getText());
                        // Atualiza o HTML do Webview
                        if (panel) {
                            panel.webview.html = getWebviewContent(updatedText);
                        }
                    }
                });

                context.subscriptions.push(onDidChangeTextDocument);

                // Limpeza ao fechar o painel
                panel.onDidDispose(() => {
                    panel = undefined;
                });
            }
        } else {
            vscode.window.showErrorMessage('Nenhuma aba ativa encontrada.');
        }
    });

    context.subscriptions.push(openAndReplicate);

    // Atualiza a referência do editor ativo quando ele mudar
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        activeEditor = editor;
    });
}

function getDates(code : string) {
    //code.matchAll(/.*(BETWEEN|between|>=|and|AND)( |\n)+(\d{6}|'\d{2}-\d{2}-\d{4}')( |\n).*/g);

    const gte_matches = code.matchAll(/.*(\>\=)( )+(\d{6}|\d{2}\/\d{2}\/\d{4}).*/g);
    let dates : string[] = [];

    for (const match of gte_matches) {
        // O grupo 3 é o índice 3 no array match
        dates.push(match[3]);
    }

    if (dates.length <= 0) {
        const between_matches = code.matchAll(/.*(BETWEEN|between)( |\n)+('|")?(\d{6}|\d{2}\/\d{2}\/\d{4})('|")?( |\n)+(AND|and)( |\n)+('|")?(\d{6}|\d{2}\/\d{2}\/\d{4})('|")?.*/g);
        for (const match of between_matches) {      //between '23-23-2222' and '23-23-2222'
            // O grupo 3 é o índice 3 no array match
            dates.push(match[4]);
            dates.push(match[10]);
        }
    }

    return dates.toString();
}
//mostrar quantas queries tem no código queries = query.split(/UNION ALL|union all/), colocar periodos e criterios e quantidade para cada querie e total de cada querie

function getTotalLimit(code : string) {

    const matches = code.matchAll(/.*(LIMIT|limit)( |\n)+([0-9\-]+)( |\n).*/g);
    let total = 0;

    while (true) {
        const match = matches.next();
        if (match.done) {
            break;
        }

        const limit = eval(match.value[3]);
        total += limit;
    }
    // for (const match of matches) {
    //     const limit = parseInt(match[3]);
    //     total += limit;
    // }


    return total;
}


function filterLines(text: string): string {
    // Converte o texto em um array de linhas
    const lines = text.split('\n');

    const nonCommentsLines = lines
        .map(line => line.trimStart())
        .filter(line => !line.startsWith('--') && line.trim() !== '' && !['(', ')'].includes(line.trim()));

    // Remove linhas que começam com "distinct"
    const textWithoutSqlNotes = nonCommentsLines
        .filter(line => !line.toLowerCase().startsWith('distinct'));

    const textWithoutDot = textWithoutSqlNotes
        .map(line => {
            const parts = line.split('.');
            // Retorna a parte após o primeiro ponto, se existir; caso contrário, retorna a linha original
            return parts.length > 1 ? parts.slice(1).join('.') : line;
        });

    // Remove tudo antes de ' as ' na linha
    const textWithoutAs = textWithoutDot
        .map(line => {
            const parts = line.split(' as ');
            return parts.length > 1 ? parts.slice(1).join(' as ') : line;
        });

    const textWithUpper = textWithoutAs.map(line => {
        const parts = line.split('_');
        if (parts.length > 1) {
            // Transforma a primeira parte em maiúsculo e junta com o restante
            const upperPart = parts[0].toUpperCase();
            const restOfLine = parts.slice(1).join('_');
            return `${upperPart}_${restOfLine}`;
        } else {
            // Se não houver '_', retorna a linha original
            return line.toUpperCase();
        }
    });

    const textWithSpaces = textWithUpper.map(line => line.replace(/_/g, ' '));

    const finalText = textWithSpaces.join('\n');

    const htmlLines = finalText.split('\n').map((line, index) => {
        const className = index % 2 === 0 ? 'line-even' : 'line-odd';
        return `<div class="${className}">${line}</div>`;
    }).join('');

    return htmlLines;
}


function getWebviewContent(code: string): string {

    const colorStyles = (code: string): string => {
        const colors = {
            'sql-keywords':  [
                'SELECT', 'FROM', 'WHERE', 'JOIN', 'GROUP BY', 'ORDER BY',
                'HAVING', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE',
                'ALTER', 'DROP', 'TABLE', 'VIEW', 'INDEX', 'AND', 'OR', 'COUNT', 'WITH', 'LIMIT'
            ],
            'green': [
                'ENDERECO', 'UF', 'MUNICIPIO', 'BAIRRO', 'LOGRADOURO', 'NUMERO', 'COMPLEMENTO', 'CEP', 'TIPO LOGRADOURO', 'ESPEC', 'DOC', 'LOCAL'
            ],
            'yellow': [
                'NOME', 'CPF'
            ],
            'light-blue': [
                'TIPO CAT', 'NUMERO CAT', 'ESPECIE', 'DESCRICAO'
            ],
            'red': [
                'MOTIVO', 'EMAIL', 'RESULTADO EMAIL'
            ],
            'purple': [
                'CELULAR', 'RESULTADO CELULAR', 'FIXO', 'RESULTADO FIXO'
            ]
        };

        const applyCssColors = (code: string, className: string, keywords: string[]): string => {
            const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');

            return code.replace(regex, `<span class="${className}">$1</span>`);
        };

        let finalCode = code;

        for (const [color, keywords] of Object.entries(colors)) {
            finalCode = applyCssColors(finalCode, color, keywords);
        }

        return finalCode;
    };

    const finalCode = colorStyles(code);
    let activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;

    let totalLimits = getTotalLimit(activeEditor?.document.getText() || '');
    let dates = getDates(activeEditor?.document.getText() || '');

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Replicado</title>
            <style>
            h4 {
            opacity: 0.8;
                }
                body {
                    font-size: 10px;
                    line-height: 19px;
                    margin: 20px;
                    font-family: monospace;
                }
                hr {
                    opacity: 0.1;
                    }
                .sql-keywords {
                    margin-left:-20px;
                    color: #007acc;
                    font-weight: bold;
                }
                .line-even {
                    background-color: #242424;
                    padding-left: 15px;
                }
                .line-odd {
                    padding-left: 10px;
                }
                .green {
                    color: #00ff00;
                }
                .yellow {
                    color: #f7ff00;
                }
                .light-blue {
                    color: #00fbff;
                }
                .red {
                    color: #ff0000;
                }
                .purple {
                    color: #cf00cf;
                }
            </style>
        </head>
        <body>
            <h1>Quantidade: ${totalLimits}</h1>
            <h4>Período: ${dates}</h2>
            <div id="code">${finalCode}</div>
        </body>
        </html>
    `;
}
