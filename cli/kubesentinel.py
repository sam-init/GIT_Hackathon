#!/usr/bin/env python3
"""KubeSentinel CLI — Kubernetes Incident Intelligence Command Line Interface."""

import click
import httpx
import json
import os
import shlex
import subprocess
import sys
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.syntax import Syntax
from rich.tree import Tree
from rich import box
from datetime import datetime

console = Console()
API_URL = os.getenv("KUBESENTINEL_API", "http://localhost:8000")

SEVERITY_COLORS = {
    "critical": "bold red",
    "high": "bold yellow",
    "medium": "yellow",
    "low": "green",
}
STATUS_COLORS = {
    "active": "red",
    "investigating": "yellow",
    "resolved": "green",
    "healthy": "green",
    "warning": "yellow",
    "critical": "red",
}


def api_get(path: str) -> dict | list:
    try:
        r = httpx.get(f"{API_URL}{path}", timeout=15)
        r.raise_for_status()
        return r.json()
    except httpx.ConnectError:
        console.print(f"[red]✗ Cannot connect to KubeSentinel backend at {API_URL}[/red]")
        console.print("[dim]Start the backend: cd backend && uvicorn main:app --reload[/dim]")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]✗ API error: {e}[/red]")
        sys.exit(1)


def api_post(path: str, data: dict = {}) -> dict:
    try:
        r = httpx.post(f"{API_URL}{path}", json=data, timeout=30)
        r.raise_for_status()
        return r.json()
    except httpx.ConnectError:
        console.print(f"[red]✗ Cannot connect to KubeSentinel backend at {API_URL}[/red]")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]✗ API error: {e}[/red]")
        sys.exit(1)


def _print_agent_command_help():
    console.print(
        Panel(
            "[bold cyan]KubeSentinel Agent Mode[/bold cyan]\n"
            "Uses the same backend Copilot context as the dashboard.\n\n"
            "[dim]Agent controls:[/dim]\n"
            "  [bold]/help[/bold]   Show commands\n"
            "  [bold]/clear[/bold]  Reset conversation memory\n"
            "  [bold]/exit[/bold]   Quit agent mode\n\n"
            "[dim]CLI commands you can run directly here:[/dim]\n"
            "  [bold]scan[/bold]\n"
            "  [bold]incidents[/bold] [dim][--status active] [--severity critical][/dim]\n"
            "  [bold]analyze[/bold] [dim]<service>[/dim]\n"
            "  [bold]trace[/bold] [dim]<service>[/dim]\n"
            "  [bold]attack-paths[/bold]\n"
            "  [bold]blast-radius[/bold] [dim]<service>[/dim]\n"
            "  [bold]explain[/bold] [dim][topic][/dim]\n"
            "  [bold]logs[/bold] [dim]<service> [--ai][/dim]",
            border_style="cyan",
        )
    )


def _run_agent_command(line: str) -> bool:
    """Run a CLI subcommand from inside agent. Returns True if handled."""
    try:
        parts = shlex.split(line)
    except ValueError as e:
        console.print(f"[red]Command parse error:[/red] {e}")
        return True

    if not parts:
        return True

    cmd = parts[0]
    if cmd not in {"scan", "incidents", "analyze", "trace", "attack-paths", "blast-radius", "explain", "logs"}:
        return False

    proc = subprocess.run([sys.executable, os.path.abspath(__file__), *parts], check=False)
    if proc.returncode != 0:
        console.print(f"[red]Command failed with exit code {proc.returncode}[/red]")
    return True


def _run_agent(history_limit: int):
    history: list[dict] = []
    _print_agent_command_help()

    while True:
        try:
            user_msg = console.input("[bold cyan]you[/bold cyan] > ").strip()
        except (KeyboardInterrupt, EOFError):
            console.print("\n[dim]Session ended.[/dim]\n")
            break

        if not user_msg:
            continue

        msg = user_msg.lower()
        if msg in {"/exit", "exit", "quit"}:
            console.print("[dim]Session ended.[/dim]\n")
            break

        if msg in {"/help", "help"}:
            _print_agent_command_help()
            continue

        if msg == "/clear":
            history.clear()
            console.print("[green]Conversation memory cleared.[/green]")
            continue

        if _run_agent_command(user_msg):
            continue

        with Progress(SpinnerColumn(), TextColumn("[cyan]Agent thinking..."), transient=True) as p:
            p.add_task("agent")
            result = api_post("/copilot/chat", {
                "message": user_msg,
                "history": history[-history_limit:],
            })

        assistant_msg = result.get("response", "No response")
        history.append({"role": "user", "content": user_msg})
        history.append({"role": "assistant", "content": assistant_msg})

        console.print(Panel(
            assistant_msg,
            title="[cyan]agent[/cyan]",
            border_style="cyan",
        ))


@click.group(invoke_without_command=True)
@click.version_option("1.0.0", prog_name="kubesentinel")
@click.pass_context
def cli(ctx):
    """
    \b
    ██╗  ██╗██╗   ██╗██████╗ ███████╗███████╗███╗   ██╗████████╗██╗███╗   ██╗███████╗██╗
    ██║ ██╔╝██║   ██║██╔══██╗██╔════╝██╔════╝████╗  ██║╚══██╔══╝██║████╗  ██║██╔════╝██║
    █████╔╝ ██║   ██║██████╔╝█████╗  ███████╗██╔██╗ ██║   ██║   ██║██╔██╗ ██║█████╗  ██║
    ██╔═██╗ ██║   ██║██╔══██╗██╔══╝  ╚════██║██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝  ██║
    ██║  ██╗╚██████╔╝██████╔╝███████╗███████║██║ ╚████║   ██║   ██║██║ ╚████║███████╗███████╗
    ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝

    AI-Powered Kubernetes Incident Intelligence Platform
    """
    if ctx.invoked_subcommand is None:
        _run_agent(history_limit=8)


@cli.command()
def scan():
    """Scan cluster topology and detect attack paths."""
    with Progress(SpinnerColumn(), TextColumn("[cyan]Scanning cluster topology..."), transient=True) as p:
        p.add_task("scan")
        topo = api_get("/graph")
        attacks = api_get("/graph/attack-paths")

    nodes = topo.get("nodes", [])
    edges = topo.get("edges", [])

    # Node type counts
    type_counts: dict = {}
    status_counts: dict = {"healthy": 0, "warning": 0, "critical": 0}
    for n in nodes:
        t = n.get("type", "unknown")
        type_counts[t] = type_counts.get(t, 0) + 1
        s = n.get("status", "healthy")
        if s in status_counts:
            status_counts[s] += 1

    console.print()
    console.print(Panel("[bold cyan]🔍 KubeSentinel Cluster Scan[/bold cyan]", border_style="cyan"))

    table = Table(box=box.ROUNDED, border_style="dim")
    table.add_column("Metric", style="bold")
    table.add_column("Value", justify="right")
    table.add_row("Total Nodes", str(len(nodes)))
    table.add_row("Total Edges", str(len(edges)))
    table.add_row("[green]Healthy[/green]", str(status_counts["healthy"]))
    table.add_row("[yellow]Warning[/yellow]", str(status_counts["warning"]))
    table.add_row("[red]Critical[/red]", str(status_counts["critical"]))
    table.add_row("Attack Paths", f"[red]{len(attacks)}[/red]" if attacks else "[green]0[/green]")
    console.print(table)

    # Node types breakdown
    type_table = Table(title="Node Types", box=box.SIMPLE, border_style="dim")
    type_table.add_column("Type", style="cyan")
    type_table.add_column("Count", justify="right")
    for t, c in sorted(type_counts.items()):
        type_table.add_row(t, str(c))
    console.print(type_table)

    if attacks:
        console.print(f"\n[bold red]⚠  {len(attacks)} Attack Path(s) Detected![/bold red]")
        for a in attacks:
            console.print(f"  [red]•[/red] {a['type']}: [dim]{a['entry']}[/dim] → [bold red]{a['role']}[/bold red] (risk: {a['risk_score']}/100)")
        console.print("\n[dim]Run: kubesentinel attack-paths  for full details[/dim]")
    else:
        console.print("\n[green]✓ No attack paths detected[/green]")
    console.print()


@cli.command()
@click.option("--status", default=None, help="Filter by status: active, investigating, resolved")
@click.option("--severity", default=None, help="Filter by severity: critical, high, medium, low")
def incidents(status, severity):
    """List active incidents."""
    params = ""
    if status:
        params += f"?status={status}"
    if severity:
        params += f"{'&' if params else '?'}severity={severity}"

    with Progress(SpinnerColumn(), TextColumn("[cyan]Fetching incidents..."), transient=True) as p:
        p.add_task("fetch")
        data = api_get(f"/incidents{params}")

    if not data:
        console.print("[green]✓ No incidents found[/green]")
        return

    console.print()
    table = Table(
        title=f"🚨 Incidents ({len(data)})",
        box=box.ROUNDED,
        border_style="dim",
        show_lines=True,
    )
    table.add_column("ID", style="dim", width=10)
    table.add_column("Severity", width=10)
    table.add_column("Title", min_width=30)
    table.add_column("Service", style="cyan")
    table.add_column("Status", width=14)
    table.add_column("Started", width=20)

    for inc in data:
        sev = inc.get("severity", "low")
        sev_style = SEVERITY_COLORS.get(sev, "white")
        st = inc.get("status", "active")
        st_style = STATUS_COLORS.get(st, "white")
        started = inc.get("started_at", "")[:16].replace("T", " ")
        table.add_row(
            inc.get("id", ""),
            f"[{sev_style}]{sev.upper()}[/{sev_style}]",
            inc.get("title", ""),
            inc.get("service", ""),
            f"[{st_style}]{st}[/{st_style}]",
            started,
        )
    console.print(table)
    console.print()


@cli.command()
@click.argument("service")
def analyze(service):
    """Run AI root cause analysis on a service."""
    console.print()
    # Find the incident for this service
    incs = api_get("/incidents")
    target = next((i for i in incs if service.lower() in i.get("service", "").lower()), None)

    if not target:
        console.print(f"[yellow]No active incident found for service: {service}[/yellow]")
        console.print("[dim]Triggering fresh analysis...[/dim]")
        result = api_post("/copilot/chat", {"message": f"Analyze the health and risks of {service} in the cluster", "history": []})
        console.print(Panel(result.get("response", "No response"), title=f"AI Analysis: {service}", border_style="cyan"))
        return

    inc_id = target["id"]
    console.print(f"[cyan]Analyzing incident {inc_id}: {target['title']}[/cyan]")

    with Progress(SpinnerColumn(), TextColumn("[cyan]Running AI Root Cause Analysis..."), transient=True) as p:
        p.add_task("analyze")
        result = api_post(f"/incidents/{inc_id}/analyze")

    rca = result.get("rca", {})
    _print_rca(rca, target)


def _print_rca(rca: dict, inc: dict):
    sev = inc.get("severity", "low")
    sev_style = SEVERITY_COLORS.get(sev, "white")
    confidence = rca.get("confidence_score", 0)
    conf_color = "green" if confidence >= 85 else "yellow" if confidence >= 70 else "red"

    console.print()
    console.print(Panel(
        f"[bold]{rca.get('root_cause', 'Unknown')}[/bold]",
        title=f"[{sev_style}]⚡ Root Cause Analysis — {inc.get('title', '')}[/{sev_style}]",
        border_style=sev_style.replace("bold ", ""),
    ))

    console.print(f"  Confidence: [{conf_color}]{confidence}%[/{conf_color}]\n")

    if rca.get("evidence"):
        console.print("[bold]Evidence:[/bold]")
        for e in rca["evidence"]:
            console.print(f"  [dim]•[/dim] {e}")

    if rca.get("affected_services"):
        console.print("\n[bold]Affected Services:[/bold]")
        for s in rca["affected_services"]:
            console.print(f"  [red]•[/red] {s}")

    if rca.get("remediation"):
        console.print("\n[bold green]Remediation Steps:[/bold green]")
        for i, r in enumerate(rca["remediation"], 1):
            console.print(f"  [green]{i}.[/green] {r}")

    if rca.get("kubectl_commands"):
        console.print("\n[bold yellow]Kubectl Commands:[/bold yellow]")
        for cmd in rca["kubectl_commands"]:
            syntax = Syntax(cmd, "bash", theme="monokai", background_color="default")
            console.print(f"  ", end="")
            console.print(syntax)
    console.print()


@cli.command()
@click.argument("service")
@click.option("--ai", is_flag=True, help="Summarize logs using AI")
def logs(service, ai):
    """Fetch and optionally summarize logs for a service using AI."""
    console.print(f"\n[cyan]Fetching logs for [bold]{service}[/bold]...[/cyan]")
    mock_logs = f"""2026-05-08T10:01:00Z INFO  Starting {service}...
2026-05-08T10:01:01Z INFO  Connecting to PostgreSQL at postgres:5432
2026-05-08T10:01:02Z ERROR dial tcp postgres:5432: connection refused
2026-05-08T10:01:02Z ERROR Failed to initialize database pool
2026-05-08T10:01:03Z FATAL max_connections exceeded on postgresql-primary
2026-05-08T10:01:03Z INFO  Retrying connection (attempt 1/3)...
2026-05-08T10:01:04Z ERROR Connection refused again after 1s backoff
2026-05-08T10:01:05Z FATAL Service startup failed, exiting with code 1"""

    syntax = Syntax(mock_logs, "log", theme="monokai", line_numbers=True)
    console.print(Panel(syntax, title=f"Logs: {service}", border_style="dim"))

    if ai:
        with Progress(SpinnerColumn(), TextColumn("[cyan]AI summarizing logs..."), transient=True) as p:
            p.add_task("summarize")
            result = api_post("/ai/summarize-logs", {"service": service, "logs": mock_logs})
        console.print(Panel(
            result.get("summary", "No summary"),
            title="[cyan]🤖 AI Log Summary[/cyan]",
            border_style="cyan",
        ))
    console.print()


@cli.command()
@click.argument("service")
def trace(service):
    """Show dependency and failure propagation path for a service."""
    with Progress(SpinnerColumn(), TextColumn("[cyan]Tracing failure propagation..."), transient=True) as p:
        p.add_task("trace")
        topo = api_get("/graph")

    nodes = {n["id"]: n for n in topo.get("nodes", [])}
    edges = topo.get("edges", [])

    # Find node by service name
    node_id = next(
        (nid for nid, n in nodes.items() if service.lower() in n.get("label", "").lower()),
        service
    )

    prop = api_get(f"/graph/propagation/{node_id}")

    console.print()
    tree = Tree(f"[bold red]⚡ {service} (FAILED)[/bold red]")
    for aff in prop.get("affected_nodes", []):
        impact = aff.get("impact", "medium")
        color = "red" if impact == "high" else "yellow"
        tree.add(f"[{color}]→ {aff['label']} ({aff['type']}) [{impact} impact][/{color}]")

    console.print(Panel(tree, title="[yellow]Failure Propagation Path[/yellow]", border_style="yellow"))
    console.print(f"  [bold]Blast radius:[/bold] {prop.get('blast_radius_count', 0)} downstream services affected\n")


@cli.command("attack-paths")
def attack_paths_cmd():
    """List all detected high-risk RBAC attack paths."""
    with Progress(SpinnerColumn(), TextColumn("[cyan]Analyzing attack paths..."), transient=True) as p:
        p.add_task("analyze")
        paths = api_get("/graph/attack-paths")
        explanation = api_get("/ai/attack-paths/explain")

    console.print()
    if not paths:
        console.print("[green]✓ No attack paths detected in current topology[/green]\n")
        return

    console.print(Panel(f"[bold red]⚠  {len(paths)} Attack Path(s) Detected[/bold red]", border_style="red"))

    for i, path in enumerate(paths, 1):
        tree = Tree(f"[bold red]Attack Path {i}: {path['type']}[/bold red]  [dim]Risk: {path['risk_score']}/100[/dim]")
        for step in path.get("path", []):
            tree.add(f"[yellow]{step}[/yellow]")
        if path.get("accessible_secrets"):
            secrets_branch = tree.add("[red]Accessible Secrets[/red]")
            for s in path["accessible_secrets"]:
                secrets_branch.add(f"[dim red]{s}[/dim red]")
        console.print(tree)
        console.print()

    if explanation.get("explanation"):
        console.print(Panel(
            explanation["explanation"],
            title="[cyan]🤖 AI Security Analysis[/cyan]",
            border_style="cyan",
        ))
    console.print()


@cli.command("blast-radius")
@click.argument("service")
def blast_radius_cmd(service):
    """Show all downstream services impacted by a failure in SERVICE."""
    with Progress(SpinnerColumn(), TextColumn("[cyan]Computing blast radius..."), transient=True) as p:
        p.add_task("compute")
        topo = api_get("/graph")

    nodes = {n["id"]: n for n in topo.get("nodes", [])}
    node_id = next(
        (nid for nid, n in nodes.items() if service.lower() in n.get("label", "").lower()),
        service
    )
    result = api_get(f"/graph/blast-radius/{node_id}")

    console.print()
    console.print(Panel(
        f"[bold red]Source:[/bold red] {service}\n"
        f"[bold yellow]Blast Radius:[/bold yellow] {result.get('count', 0)} downstream nodes affected",
        title="💥 Blast Radius Analysis",
        border_style="red",
    ))

    affected = result.get("affected_nodes", [])
    if affected:
        table = Table(box=box.SIMPLE)
        table.add_column("Service ID", style="dim")
        table.add_column("Type", style="cyan")
        for nid in affected:
            node = nodes.get(nid, {})
            table.add_row(node.get("label", nid), node.get("type", "unknown"))
        console.print(table)
    else:
        console.print("[green]  No downstream services affected[/green]")
    console.print()


@cli.command("explain")
@click.argument("topic", default="attack-path")
def explain(topic):
    """AI explains a security or infrastructure topic (e.g., attack-path)."""
    with Progress(SpinnerColumn(), TextColumn("[cyan]Generating AI explanation..."), transient=True) as p:
        p.add_task("explain")
        if "attack" in topic:
            result = api_get("/ai/attack-paths/explain")
            text = result.get("explanation", "No explanation available.")
        else:
            resp = api_post("/copilot/chat", {
                "message": f"Explain {topic} in the context of this Kubernetes cluster",
                "history": []
            })
            text = resp.get("response", "No explanation available.")

    console.print()
    console.print(Panel(text, title=f"[cyan]🤖 AI Explanation: {topic}[/cyan]", border_style="cyan"))
    console.print()


@cli.command("agent")
@click.option("--history-limit", default=8, show_default=True, help="How many recent messages to send as context")
def agent_cmd(history_limit: int):
    """Run an interactive AI Copilot agent session in your terminal."""
    _run_agent(history_limit=history_limit)


if __name__ == "__main__":
    cli()
