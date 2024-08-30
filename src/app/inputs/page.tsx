export default function Page() {
    return <div className="debugInputContainer">
        <label>Textarea</label><input type="textarea" />
        <label>Text</label><input type="text" />
        <label>Select</label><select>
            <option>Option1</option>
            <option>Option2</option>
            <option>Option3</option>
            <option>Option4</option>
        </select>
        <label>button</label><button>button</button>
        <label>checkbox</label><input type="checkbox"/>
    </div>
}